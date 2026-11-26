# BUGATTI — Pour l'Éternité

An independent, single-page digital concept centered on the Bugatti Tourbillon. It is not an official Bugatti website and is not affiliated with Bugatti Automobiles S.A.S.

## Experience
- Cinematic editorial hero and scroll-led storytelling
- Responsive navigation overlay with Escape-key dismissal
- Engineering overview using published Tourbillon specifications
- Craftsmanship and haute-horlogerie feature sections
- Interactive visual finish and interior-material selector (art direction preview only; not a factory configurator)
- Reduced-motion support, keyboard focus states, lazy-loaded supporting imagery, and no analytics or advertising

## Design direction
Midnight navy, Bugatti-inspired blue, platinum/ice, and restrained champagne accents. The layout is original and uses Bugatti's public identity and Tourbillon story as reference points rather than reproducing the official site.

## Sources
- Bugatti official website: https://www.bugatti.com/
- Bugatti Tourbillon V16 / hybrid powertrain: https://newsroom.bugatti.com/en/press-releases/silence-to-symphony
- Bugatti Tourbillon bespoke configuration: https://newsroom.bugatti.com/en/press-releases/the-bugatti-tourbillon-configuration
- Bugatti Tourbillon haute horlogerie: https://newsroom.bugatti.com/en/press-releases/haute-horlogerie-to-the-bugatti-tourbillon
- Bugatti website design recognition: https://ifdesign.com/en/winner-ranking/project/bugatti-website/767079

Photography is remotely embedded from the image publishers / Bugatti Newsroom for this independent concept. Image rights remain with their respective owners; replace with licensed assets before commercial use.

## Run locally
Open `index.html` in a modern browser. No build step or framework is required.

## QA status
- Static JavaScript syntax: checked with Node.js.
- HTML structure: checked for duplicate IDs and broken internal anchor targets.
- Real-browser Playwright checks: provided in `../../scripts/smoke-bugatti-atelier.mjs`; CI uses the official Playwright 1.56.1 Noble container to avoid runner/OS mismatch.
- Physical Android-device testing and image-host availability are not verified in this environment.