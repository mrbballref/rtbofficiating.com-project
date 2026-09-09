from __future__ import annotations

import json
import socketserver
import subprocess
import threading
import time
from pathlib import Path
from urllib.request import urlopen

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import tinycss2

REPO = Path.cwd()
PLATFORM = REPO / "STANDALONE_PLATFORMS" / "01_RTBO_Core_Website"
EVIDENCE = REPO / ".validation-evidence" / "core"
SCREENSHOTS = EVIDENCE / "screenshots"
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}/STANDALONE_PLATFORMS/01_RTBO_Core_Website/index.html"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def static_audit() -> dict:
    errors: list[str] = []
    html_files = sorted(PLATFORM.rglob("*.html"))
    require(len(html_files) == 28, f"Expected 28 HTML files, found {len(html_files)}")

    banned = (
        "raisingthebarofficiating.com",
        "The Save",
        "Arkansas Baptist College Classic",
        "Arkansas Sports Hall of Fame",
    )

    for file in html_files:
        text = file.read_text(encoding="utf-8")
        soup = BeautifulSoup(text, "html.parser")
        rel = file.relative_to(PLATFORM)
        require(text.lstrip().lower().startswith("<!doctype html>"), f"{rel}: missing doctype")
        require(soup.html is not None and soup.html.get("lang") == "en", f"{rel}: invalid document language")
        for selector, name in (
            ('meta[charset]', 'charset'),
            ('meta[name="viewport"]', 'viewport'),
            ('meta[name="description"]', 'description'),
            ('link[rel="canonical"]', 'canonical'),
            ('link[rel="icon"]', 'favicon'),
            ('link[rel="manifest"]', 'manifest'),
        ):
            require(soup.select_one(selector) is not None, f"{rel}: missing {name}")
        require(soup.title is not None and soup.title.get_text(strip=True), f"{rel}: missing title")
        require(len(soup.find_all("h1")) == 1, f"{rel}: expected exactly one h1")
        require(soup.find("header") and soup.find("main", id="main-content") and soup.find("footer"), f"{rel}: missing landmark")

        ids = [node.get("id") for node in soup.find_all(id=True)]
        require(len(ids) == len(set(ids)), f"{rel}: duplicate ID")
        for control in soup.find_all(attrs={"aria-controls": True}):
            target_id = control["aria-controls"]
            require(target_id in ids, f"{rel}: missing aria-controls target {target_id}")
            if control.get("aria-expanded") == "false":
                target = soup.find(id=target_id)
                require(target is None or target.has_attr("hidden"), f"{rel}: collapsed control target not hidden: {target_id}")

        require(soup.find("a", href="#") is None, f"{rel}: contains href=#")
        for value in banned:
            require(value not in text, f"{rel}: contains banned value {value}")
        require(soup.find("style") is None, f"{rel}: inline style element")
        require(soup.find("script", src=False) is None, f"{rel}: inline script")
        for node in soup.find_all(True):
            require(not node.has_attr("style"), f"{rel}: inline style attribute")
            for attr in node.attrs:
                require(not attr.lower().startswith("on"), f"{rel}: inline event handler {attr}")
        for image in soup.find_all("img"):
            require(image.has_attr("alt"), f"{rel}: image missing alt")

        for tag, attr in (("a", "href"), ("link", "href"), ("script", "src")):
            for node in soup.find_all(tag):
                value = node.get(attr)
                if not value or value.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
                    continue
                target = (file.parent / value).resolve()
                try:
                    target.relative_to(PLATFORM)
                except ValueError:
                    continue
                require(target.exists(), f"{rel}: missing internal target {value}")

    css_files = sorted(PLATFORM.rglob("*.css"))
    all_css = "\n".join(file.read_text(encoding="utf-8") for file in css_files)
    require("!important" not in all_css, "Core CSS contains !important")
    for file in css_files:
        for token in tinycss2.parse_stylesheet(file.read_text(encoding="utf-8"), skip_comments=False, skip_whitespace=False):
            require(token.type != "error", f"CSS parse error in {file.relative_to(PLATFORM)}: {getattr(token, 'message', '')}")

    for file in sorted(PLATFORM.rglob("*.js")):
        result = subprocess.run(["node", "--check", str(file)], capture_output=True, text=True)
        require(result.returncode == 0, f"JavaScript syntax error in {file.relative_to(PLATFORM)}: {result.stderr}")

    manifest = json.loads((PLATFORM / "manifest.webmanifest").read_text(encoding="utf-8"))
    for key in ("name", "short_name", "start_url", "scope", "display", "background_color", "theme_color", "description"):
        require(key in manifest, f"Manifest missing {key}")

    return {"html_files": len(html_files), "css_files": len(css_files), "errors": errors}


class QuietHandler(__import__("http.server").server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


def start_server():
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(REPO), **kwargs)
    server = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), handler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    for _ in range(50):
        try:
            with urlopen(BASE, timeout=1) as response:
                require(response.status == 200, f"Homepage returned HTTP {response.status}")
            break
        except Exception:
            time.sleep(0.1)
    else:
        server.shutdown()
        raise RuntimeError("Local HTTP server did not become ready")
    return server


def browser_audit() -> dict:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    evidence: dict = {"breakpoints": {}, "interactions": {}, "pages": {}}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1600, "height": 900})
        page = context.new_page()
        console_errors: list[str] = []
        page_errors: list[str] = []
        local_failures: list[str] = []
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on("response", lambda response: local_failures.append(f"{response.status} {response.url}") if response.status >= 400 and response.url.startswith("http://127.0.0.1") else None)

        response = page.goto(BASE, wait_until="networkidle")
        require(response is not None and response.status == 200, "Homepage did not return HTTP 200")
        require(page.title() == "Raising The Bar Officiating | RTBO", "Unexpected homepage title")

        about = page.locator('button[aria-controls="about-submenu"]')
        about.click()
        require(about.get_attribute("aria-expanded") == "true", "Desktop About did not expand")
        require(not page.locator("#about-submenu").evaluate("el => el.hidden"), "Desktop About panel remained hidden")
        about.press("Escape")
        require(about.get_attribute("aria-expanded") == "false", "Desktop About did not collapse on Escape")
        require(page.locator("#about-submenu").evaluate("el => el.hidden"), "Desktop About panel remained visible")
        require(page.evaluate("document.activeElement === document.querySelector('[aria-controls=about-submenu]')"), "Desktop disclosure focus was not restored")
        evidence["interactions"]["desktop_disclosure_escape"] = "PASS"

        # Dialog and focus restoration.
        signup = page.get_by_role("button", name="Sign Up")
        signup.click()
        require(page.locator("#sign-up-dialog").evaluate("el => el.open"), "Sign Up dialog did not open")
        page.keyboard.press("Escape")
        require(not page.locator("#sign-up-dialog").evaluate("el => el.open"), "Sign Up dialog did not close on Escape")
        require(page.evaluate("document.activeElement === document.querySelector('[data-dialog-open=sign-up-dialog]')"), "Dialog focus was not restored")
        evidence["interactions"]["dialog_escape_focus"] = "PASS"

        for width in (1600, 1441, 1440, 1321, 1320, 1024, 760, 600, 320):
            page.set_viewport_size({"width": width, "height": 900})
            page.wait_for_timeout(80)
            desktop_visible = page.locator(".rtbo-primary-nav").is_visible()
            mobile_toggle_visible = page.locator("[data-mobile-nav-toggle]").is_visible()
            if width >= 1321:
                require(desktop_visible, f"Desktop navigation hidden at {width}px")
                require(not mobile_toggle_visible, f"Mobile toggle visible at {width}px")
                brand = page.locator(".rtbo-primary-nav__brand").bounding_box()
                require(brand is not None, f"Desktop brand missing at {width}px")
                brand_center = brand["x"] + brand["width"] / 2
                require(abs(brand_center - width / 2) <= 2.5, f"Centered brand drift at {width}px: {brand_center - width/2:.2f}px")
            else:
                require(not desktop_visible, f"Desktop navigation visible at {width}px")
                require(mobile_toggle_visible, f"Mobile toggle hidden at {width}px")
            overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            require(not overflow, f"Horizontal overflow at {width}px")
            evidence["breakpoints"][str(width)] = {"desktop": desktop_visible, "mobile_toggle": mobile_toggle_visible, "overflow": overflow}
            page.screenshot(path=str(SCREENSHOTS / f"home-{width}.png"), full_page=True)

        # Mobile drawer + two-stage Escape behavior.
        page.set_viewport_size({"width": 600, "height": 900})
        page.reload(wait_until="networkidle")
        toggle = page.locator("[data-mobile-nav-toggle]")
        nav = page.locator("[data-mobile-nav]")
        require(nav.evaluate("el => el.hidden"), "Mobile navigation did not start hidden")
        toggle.click()
        require(toggle.get_attribute("aria-expanded") == "true" and not nav.evaluate("el => el.hidden"), "Mobile navigation did not open")
        require(toggle.get_attribute("aria-label") == "Close navigation", "Mobile toggle label did not change")
        mobile_about = page.locator('button[aria-controls="mobile-about-submenu"]')
        mobile_about.click()
        require(mobile_about.get_attribute("aria-expanded") == "true", "Mobile About did not expand")
        mobile_about.press("Escape")
        require(mobile_about.get_attribute("aria-expanded") == "false", "First Escape did not close mobile submenu")
        require(not nav.evaluate("el => el.hidden"), "First Escape incorrectly closed mobile drawer")
        page.keyboard.press("Escape")
        require(nav.evaluate("el => el.hidden"), "Second Escape did not close mobile drawer")
        require(toggle.get_attribute("aria-expanded") == "false" and toggle.get_attribute("aria-label") == "Open navigation", "Mobile toggle state did not reset")
        evidence["interactions"]["mobile_two_stage_escape"] = "PASS"

        # Skip-link focus.
        page.set_viewport_size({"width": 1600, "height": 900})
        page.goto(BASE, wait_until="networkidle")
        page.locator(".skip-link").focus()
        page.locator(".skip-link").press("Enter")
        page.wait_for_timeout(50)
        require(page.evaluate("location.hash") == "#main-content", "Skip link did not target main content")
        require(page.evaluate("document.activeElement && document.activeElement.id") == "main-content", "Skip link did not move focus to main")
        evidence["interactions"]["skip_link_focus"] = "PASS"

        # Consent persistence and privacy-dialog access.
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        banner = page.locator("[data-consent-banner]")
        require(banner.is_visible(), "Consent banner not shown for first visit")
        page.locator('[data-consent-choice="essential"]').click()
        require(not banner.is_visible(), "Consent banner did not close")
        page.reload(wait_until="networkidle")
        require(not banner.is_visible(), "Consent preference did not persist")
        privacy_button = page.get_by_role("button", name="Privacy Choices")
        privacy_button.click()
        require(page.locator("#privacy-preferences-dialog").evaluate("el => el.open"), "Privacy preferences dialog did not open")
        page.keyboard.press("Escape")
        evidence["interactions"]["consent_persistence"] = "PASS"

        # Every Core page returns HTTP 200 and parses without local runtime errors.
        for file in sorted(PLATFORM.rglob("*.html")):
            relative = file.relative_to(REPO).as_posix()
            url = f"http://127.0.0.1:{PORT}/{relative}"
            before_console = len(console_errors)
            before_page = len(page_errors)
            before_local = len(local_failures)
            res = page.goto(url, wait_until="networkidle")
            require(res is not None and res.status == 200, f"{relative} failed HTTP 200")
            require(len(console_errors) == before_console, f"Console error on {relative}: {console_errors[before_console:]}")
            require(len(page_errors) == before_page, f"Page error on {relative}: {page_errors[before_page:]}")
            require(len(local_failures) == before_local, f"Local resource failure on {relative}: {local_failures[before_local:]}")
            evidence["pages"][relative] = 200

        require(not console_errors, "Console errors:\n" + "\n".join(console_errors))
        require(not page_errors, "Page errors:\n" + "\n".join(page_errors))
        require(not local_failures, "Local HTTP failures:\n" + "\n".join(local_failures))
        browser.close()
    return evidence


def main() -> None:
    require(PLATFORM.exists(), f"Missing normal Core source tree: {PLATFORM}")
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    static = static_audit()
    server = start_server()
    try:
        browser = browser_audit()
    finally:
        server.shutdown()
        server.server_close()
    evidence = {"static": static, "browser": browser, "status": "PASS"}
    (EVIDENCE / "core-validation.json").write_text(json.dumps(evidence, indent=2), encoding="utf-8")
    print(json.dumps(evidence, indent=2))


if __name__ == "__main__":
    main()
