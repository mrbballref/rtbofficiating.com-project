from __future__ import annotations

import contextlib
import http.server
import json
import os
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
ARCHIVE = REPO / "SOURCE_DRAFTS/01_RTBO_Core_Website/01_RTBO_Core_Website_SOURCE_DRAFT.tar.gz"
WORK = REPO / ".validation-work/core"
PLATFORM = WORK / "STANDALONE_PLATFORMS/01_RTBO_Core_Website"
SCREENSHOTS = REPO / ".validation-evidence/core/screenshots"
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}/STANDALONE_PLATFORMS/01_RTBO_Core_Website/index.html"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def extract_snapshot() -> None:
    require(ARCHIVE.exists(), f"Missing source draft archive: {ARCHIVE}")
    WORK.mkdir(parents=True, exist_ok=True)
    subprocess.run(["tar", "-xzf", str(ARCHIVE), "-C", str(WORK)], check=True)
    require(PLATFORM.exists(), "Extracted Core platform root is missing")


def static_audit() -> dict:
    errors: list[str] = []
    html_files = sorted(PLATFORM.glob("**/*.html"))
    require(len(html_files) == 28, f"Expected 28 HTML files, found {len(html_files)}")

    banned = (
        "The Save",
        "Arkansas Baptist College Classic",
        "Arkansas Sports Hall of Fame",
        "raisingthebarofficiating.com",
    )

    for file in html_files:
        text = file.read_text(encoding="utf-8")
        soup = BeautifulSoup(text, "html.parser")
        ids = [element.get("id") for element in soup.find_all(id=True)]
        duplicates = sorted({item for item in ids if ids.count(item) > 1})
        if duplicates:
            errors.append(f"{file.relative_to(PLATFORM)} duplicate IDs: {duplicates}")

        for forbidden in banned:
            if forbidden in text:
                errors.append(f"{file.relative_to(PLATFORM)} contains forbidden value: {forbidden}")

        if soup.find("a", href="#"):
            errors.append(f"{file.relative_to(PLATFORM)} contains href=#")

        for control in soup.find_all(attrs={"aria-controls": True}):
            target = control.get("aria-controls")
            if target and soup.find(id=target) is None:
                errors.append(f"{file.relative_to(PLATFORM)} missing aria-controls target: {target}")

        for tag, attr in (("link", "href"), ("script", "src")):
            for element in soup.find_all(tag):
                value = element.get(attr)
                if not value or value.startswith(("http://", "https://", "data:")):
                    continue
                target = (file.parent / value).resolve()
                if not target.exists():
                    errors.append(f"{file.relative_to(PLATFORM)} missing resource: {value}")

        for anchor in soup.find_all("a", href=True):
            value = anchor["href"]
            if value.startswith(("http://", "https://", "#", "mailto:", "tel:")):
                continue
            target = (file.parent / value).resolve()
            try:
                target.relative_to(PLATFORM)
            except ValueError:
                continue
            if not target.exists():
                errors.append(f"{file.relative_to(PLATFORM)} missing internal route: {value}")

    css_errors: list[str] = []
    css_texts: list[str] = []
    for file in sorted(PLATFORM.glob("**/*.css")):
        text = file.read_text(encoding="utf-8")
        css_texts.append(text)
        parsed = tinycss2.parse_stylesheet(text, skip_comments=False, skip_whitespace=False)
        for item in parsed:
            if item.type == "error":
                css_errors.append(f"{file.relative_to(PLATFORM)}: {item.message}")

    require(not errors, "Static HTML/resource audit failed:\n" + "\n".join(errors))
    require(not css_errors, "CSS parse audit failed:\n" + "\n".join(css_errors))
    require("!important" not in "\n".join(css_texts), "Found !important in Core CSS")

    for file in sorted(PLATFORM.glob("js/**/*.js")):
        subprocess.run(["node", "--check", str(file)], check=True)

    json.loads((PLATFORM / "manifest.webmanifest").read_text(encoding="utf-8"))

    return {
        "html_files": len(html_files),
        "html_resource_errors": len(errors),
        "css_parse_errors": len(css_errors),
    }


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


def start_server():
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(WORK), **kwargs)
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
    evidence: dict = {"breakpoints": {}, "interactions": {}}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 900})
        console_errors: list[str] = []
        page_errors: list[str] = []
        failed_responses: list[str] = []

        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on(
            "response",
            lambda response: failed_responses.append(f"{response.status} {response.url}")
            if response.status >= 400 and response.url.startswith("http://127.0.0.1")
            else None,
        )

        response = page.goto(BASE, wait_until="networkidle")
        require(response is not None and response.status == 200, "Homepage did not return HTTP 200")
        require(page.title() == "Raising The Bar Officiating | RTBO", "Unexpected homepage title")

        about = page.locator('button[aria-controls="about-submenu"]')
        about.click()
        require(about.get_attribute("aria-expanded") == "true", "Desktop About toggle did not expand")
        require(not page.locator("#about-submenu").evaluate("element => element.hidden"), "Desktop About submenu stayed hidden")
        about.press("Escape")
        require(about.get_attribute("aria-expanded") == "false", "Desktop About toggle did not collapse on Escape")
        require(page.locator("#about-submenu").evaluate("element => element.hidden"), "Desktop About submenu stayed visible after Escape")
        require(page.evaluate("document.activeElement === document.querySelector('[aria-controls=about-submenu]')"), "Focus did not return to desktop About toggle")
        evidence["interactions"]["desktop_disclosure_escape"] = "PASS"

        for width in (1441, 1440, 1321, 1320, 1024, 760, 600, 320):
            page.set_viewport_size({"width": width, "height": 900})
            page.wait_for_timeout(50)
            desktop_visible = page.locator(".rtbo-primary-nav__list").first.is_visible()
            mobile_visible = page.locator("[data-mobile-nav-toggle]").is_visible()
            if width >= 1321:
                require(desktop_visible, f"Desktop nav hidden at {width}px")
                require(not mobile_visible, f"Mobile toggle visible at {width}px")
            else:
                require(not desktop_visible, f"Desktop nav visible at {width}px")
                require(mobile_visible, f"Mobile toggle hidden at {width}px")
            overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            require(not overflow, f"Horizontal overflow at {width}px")
            evidence["breakpoints"][str(width)] = {
                "desktop_navigation_visible": desktop_visible,
                "mobile_toggle_visible": mobile_visible,
                "horizontal_overflow": overflow,
            }
            page.screenshot(path=str(SCREENSHOTS / f"home-{width}.png"), full_page=True)

        page.set_viewport_size({"width": 600, "height": 900})
        page.reload(wait_until="networkidle")
        mobile_toggle = page.locator("[data-mobile-nav-toggle]")
        mobile_navigation = page.locator("[data-mobile-nav]")
        require(mobile_navigation.evaluate("element => element.hidden"), "Mobile navigation should start hidden")
        mobile_toggle.click()
        require(mobile_toggle.get_attribute("aria-expanded") == "true", "Mobile navigation aria-expanded did not become true")
        require(mobile_toggle.get_attribute("aria-label") == "Close navigation", "Mobile navigation label did not change to Close navigation")
        require(not mobile_navigation.evaluate("element => element.hidden"), "Mobile navigation did not open")

        mobile_about = page.locator('button[aria-controls="mobile-about-submenu"]')
        mobile_about.click()
        require(mobile_about.get_attribute("aria-expanded") == "true", "Mobile About submenu did not open")
        mobile_about.press("Escape")
        require(mobile_about.get_attribute("aria-expanded") == "false", "Mobile About submenu did not close on first Escape")
        require(not mobile_navigation.evaluate("element => element.hidden"), "First Escape also closed the mobile drawer")
        require(page.evaluate("document.activeElement === document.querySelector('[aria-controls=mobile-about-submenu]')"), "Focus did not return to mobile About toggle")
        page.keyboard.press("Escape")
        require(mobile_navigation.evaluate("element => element.hidden"), "Second Escape did not close mobile navigation")
        require(mobile_toggle.get_attribute("aria-expanded") == "false", "Mobile nav aria-expanded did not reset")
        require(mobile_toggle.get_attribute("aria-label") == "Open navigation", "Mobile nav label did not reset")
        evidence["interactions"]["mobile_two_stage_escape"] = "PASS"

        page.goto(BASE, wait_until="networkidle")
        page.locator(".skip-link").focus()
        page.locator(".skip-link").press("Enter")
        page.wait_for_timeout(50)
        require(page.evaluate("location.hash") == "#main-content", "Skip link did not target main content")
        require(page.evaluate("document.activeElement && document.activeElement.id") == "main-content", "Skip link did not move focus to main content")
        evidence["interactions"]["skip_link_focus"] = "PASS"

        require(not console_errors, "Console errors:\n" + "\n".join(console_errors))
        require(not page_errors, "Page errors:\n" + "\n".join(page_errors))
        require(not failed_responses, "Failed local responses:\n" + "\n".join(failed_responses))
        evidence["console_errors"] = console_errors
        evidence["page_errors"] = page_errors
        evidence["failed_local_responses"] = failed_responses
        browser.close()

    return evidence


def main() -> None:
    extract_snapshot()
    static = static_audit()
    server = start_server()
    try:
        browser = browser_audit()
    finally:
        server.shutdown()
        server.server_close()

    evidence = {"static": static, "browser": browser, "status": "PASS"}
    evidence_path = REPO / ".validation-evidence/core/core-validation.json"
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    evidence_path.write_text(json.dumps(evidence, indent=2), encoding="utf-8")
    print(json.dumps(evidence, indent=2))


if __name__ == "__main__":
    main()
