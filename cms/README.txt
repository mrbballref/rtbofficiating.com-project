RAISING THE BAR OFFICIATING — MASTER CONTENT MANAGEMENT SYSTEM

ENTRY POINT
cms/index.html

CAPABILITIES
- Real project-wide page, section, element, form and media inventory.
- Draft/published content overrides.
- Text, HTML, attributes, media paths, visibility and section creation.
- Page title, meta description, custom CSS and page disable controls.
- Navigation label and destination management.
- Existing media catalog plus IndexedDB CMS media uploads.
- Training-school registration management and CSV export.
- Generic localStorage platform-data editor.
- Global CSS variables and CSS overrides.
- SEO manager.
- CMS-created page CRUD.
- Publish-all, page publishing, JSON backup/import and audit history.

IMPLEMENTATION
A lightweight cms/runtime.js script is added to project HTML pages. It applies published
overrides after each page loads and does not replace the original source markup or existing
platform JavaScript. CMS settings are browser-local using localStorage/IndexedDB.

For reliable shared storage across every subpage, serve the complete project from one web
origin rather than opening unrelated files from different folders.
