# BUGATTI — Pour l'Éternité

An independent, single-page digital concept centered on the Bugatti Tourbillon. It is not an official Bugatti website and is not affiliated with Bugatti Automobiles S.A.S.

## Brand & motion system
- Original Atelier Tourbillon concept seal and matching favicon; this is not the official Bugatti EB emblem.
- Editorial wordmark lockup, Atelier 01 descriptor, and consistent midnight / ice / champagne visual tokens.
- Cinematic title entrance, pointer-responsive hero parallax on fine-pointer desktops, scroll progress, reveal choreography, and restrained micro-interactions.
- Pointer motion is disabled for reduced-motion users and touch-first devices; CSS transitions and entrance animations honor `prefers-reduced-motion`.
- The hero parallax is layered photography, not a real-time 3D vehicle model.

## Experience
- Cinematic editorial hero, pointer parallax, and scroll-led storytelling
- Responsive navigation overlay with Escape-key dismissal
- Engineering overview using published Tourbillon specifications
- Craftsmanship and haute-horlogerie feature sections
- Interactive visual finish and interior-material selector (art direction preview only; not a factory configurator)
- Reduced-motion support, keyboard focus states, lazy-loaded supporting imagery, and no analytics or advertising


## Horizontal cinematic experience
- The original vertical editorial page is now arranged as nine horizontal full-screen scenes, navigable right-to-left with wheel, trackpad, touch, keyboard arrows, and previous/next controls.
- A four-model selection chapter presents the Tourbillon, Chiron, Bolide, and W16 Mistral. Selecting a model opens its own full-screen cinematic spotlight with an animated camera pan, model-specific copy, and accessible close behavior.
- Interface sound effects are synthesized locally with Web Audio and remain OFF until the visitor explicitly enables them. No audio autoplay, remote sound files, analytics, or tracking.
- The car spotlight motion is a layered photographic camera move, not footage of a physically driving car and not a genuine 3D model. A real rotatable 3D configurator remains a separate future enhancement pending a properly licensed model.
- Mobile keeps horizontal swipe navigation while allowing vertical reading inside an individual scene. Reduced-motion preferences disable the strongest scene and camera animations.
- Model image references: [Bugatti Newsroom — Chiron](https://newsroom.bugatti.com/de/pressemeldungen/die-design-dna-der-bugatti-hypersportwagen), [AutoDaily — Bolide](https://www.autodaily.com.au/bugatti-bolide-hypercar-hits-the-track/), [Carsales — W16 Mistral](https://www.carsales.com.au/editorial/details/bugatti-w16-mistral-roadster-unveiled-137094/). Image rights remain with their respective owners.

## Reference-led motion update
- The horizontal scene system now uses a restrained champagne/ice sweep as a transition cue when a new chapter becomes active. The effect is CSS-only, runs only on scene changes, and is disabled for reduced-motion visitors.
- The motion direction combines Apple-style product storytelling and clean hierarchy, Nothing-inspired graphic restraint, and the immersive scene choreography associated with Active Theory and Resn. These are design references, not copied layouts or assets.
- Engineering menu navigation now targets the actual Engineering scene (scene 05 of 09); the previous mapping landed one scene early.
- The existing native horizontal scroll, touch swipe, wheel/trackpad navigation, keyboard controls, car spotlights, finish selector, and opt-in synthesized UI sounds are preserved.
- Reference sites reviewed: [Apple](https://www.apple.com/), [Nothing](https://nothing.tech/), [Active Theory](https://activetheory.net/), [Resn](https://resn.co.nz/), and [Awwwards](https://www.awwwards.com/). Active Theory and Resn are JavaScript-heavy, so their live motion could not be fully inspected through text extraction; the implementation uses the general immersive direction rather than claiming a direct technical reproduction.

## Design direction
Midnight navy, Bugatti-inspired blue, platinum/ice, and restrained champagne accents. The layout is original and uses Bugatti's public identity and Tourbillon story as reference points rather than reproducing the official site.

## Sources
- Bugatti official website: https://www.bugatti.com/
- Bugatti Tourbillon V16 / hybrid powertrain: https://newsroom.bugatti.com/en/press-releases/silence-to-symphony
- Bugatti Tourbillon bespoke configuration: https://newsroom.bugatti.com/en/press-releases/the-bugatti-tourbillon-configuration
- Bugatti Tourbillon haute horlogerie: https://newsroom.bugatti.com/en/press-releases/haute-horlogerie-to-the-bugatti-tourbillon
- Bugatti website design recognition: https://ifdesign.com/en/winner-ranking/project/bugatti-website/767079
- CompleteCar Tourbillon image source: https://www.completecar.ie/car-news/article/13415/Bugatti-Tourbillon-is-1800hp-hybrid

Photography is remotely embedded from the image publishers / Bugatti Newsroom for this independent concept. Image rights remain with their respective owners; replace with licensed assets before commercial use.

## Run locally
Open `index.html` in a modern browser. No build step or framework is required.

## QA status
- Static JavaScript syntax: checked with Node.js.
- HTML structure: checked for duplicate IDs and broken internal anchor targets.
- Baseline real-browser Playwright smoke: passed in GitHub Actions on 2026-11-26 using the official Playwright 1.56.1 Noble container. Coverage: navigation, Escape dismissal, finish/material selectors, 390px mobile overflow, image alt text, and uncaught page errors.
- Expanded horizontal-scene / car-spotlight / optional-sound E2E suite: added; current CI run will verify the new interactions.
- All seven remote images decoded successfully in the Playwright CI browser. Physical Android-device testing remains pending.