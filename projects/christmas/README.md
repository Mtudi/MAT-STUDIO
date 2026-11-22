# MATUDI Christmas Studio

A standalone holiday card maker with shareable greeting links.

## Features

- Three themes: Classic, Midnight and Snow.
- Live preview with recipient, message and sender fields.
- Automatic local draft saving, explicit Save Draft and Clear Draft controls.
- Shareable URLs using compact Base64URL-encoded UTF-8 data, including Arabic text.
- Shared-card view with a Create Your Own action.
- Client-side PNG export using the Canvas API; no third-party image library.
- Print stylesheet and responsive mobile layout.

## Privacy

- Drafts are stored in the current browser's local storage.
- A share link includes the greeting content in its URL. Anyone with the link can read that content; do not include private information.
- The page does not upload drafts or card content to a backend.

## Verification

Playwright checks Unicode/Arabic share-link round trips, local draft persistence, theme switching, PNG download, shared-view navigation and 390px mobile layout.
