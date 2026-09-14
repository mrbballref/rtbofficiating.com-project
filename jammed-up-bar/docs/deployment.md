# Deployment notes

The package is structured as the `/jammed-up-bar/` property within the broader RTBO website. Primary RTBO navigation links intentionally point to parent-site routes such as `../about/`, `../events/`, and `../refzone-university/`.

For local review:

```bash
cd The_Jammed_Up_Bar_Podcast_Platform
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

For RTBO integration, copy this folder into the desired Jammed Up Bar route and verify parent-site paths. Do not change the supplied Jammed Up Bar logo or approved RTBO navigation asset unless a new approved asset is supplied.
