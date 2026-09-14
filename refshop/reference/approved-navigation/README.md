# RTBO Responsive Navigation Menu

## Files
- `index.html` — navigation markup and demo sections
- `styles.css` — desktop/mobile styling, hover states, active states, dropdowns, and animations
- `script.js` — dropdown, active-state, mobile-menu, outside-click, and Escape-key behavior
- `assets/rtbo-logo.png` — approved RTBO logo supplied by the client

## CTA links
The demo currently uses section anchors:
- `Let's Talk` → `#contact`
- `Register` → `#registration`

Replace those `href` values in `index.html` with the final contact and registration form URLs when available.

## Open locally
Open `index.html` in a browser. For best results, serve the folder with a local server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Latest corrections

- The main navigation border now uses a layered burnt-orange, crimson, warm-silver chrome treatment.
- Desktop dropdowns open only through their main menu buttons, so clicking an open main item closes it immediately.
- Desktop and mobile dropdowns close after any dropdown link is selected.
