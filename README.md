# MAT-STUDIO

MAT-STUDIO is the public source hub for Matudi's independent digital products and experiments.

**Project hub source:** `projects/hub/index.html` — the GitHub-backed launchpad for the MATUDI ecosystem. After this change is merged and deployed, open it at `/projects/hub/index.html`.

## Web experiences

- [Xi Personal AI](https://mat-studio.vercel.app/) — owner-authenticated personal AI workspace.
- [MATUDI AI Workspace release candidate](https://github.com/Mtudi/MAT-STUDIO/pull/11) — guest chat, streaming and optional cloud sync; production route is withheld until the Xi/Workspace source overlap is resolved and real-provider checks pass.
- [MATUDI Chess Lab](https://mat-studio.vercel.app/projects/chess-lab/index.html) — legal chess practice, opening lines and FEN/PGN tools.
- [MATSONG interactive preview](https://sharable.link/89k1u749) — local music library and Spotify embeds.
- [MATUDI DEUTSCH A1 preview](https://sharable.link/t5cevsdg) — German A1 starter learning.
- [MATUDI Christmas](https://mat-studio.vercel.app/projects/christmas/index.html) — interactive greeting-card creator.
- [MATUDI Portfolio](https://mat-studio.vercel.app/projects/portfolio/index.html) — personal portfolio.
- [Motion Atelier 3D Studio](https://mat-studio.vercel.app/Motion%20Atelier%203D%20Studio.html) — browser-based 3D character and animation studio.
- [Motion Atelier Open-Source Toolchain](https://mat-studio.vercel.app/motion-toolchain.html) — ten specialist tools, verified interchange paths and integration roadmap. [Live preview](https://sharable.link/jf22dpsr).

## Experiments and local tools

- `experiments/xi-chatgpt-edition/` — archived multi-provider Xi and OpenAI/ChatGPT editions; they require the viewer's own provider key where applicable.
- `projects/matsong-next/` — separate development branch experiment for music discovery and Spotify Web Playback.
- `bridge/` — local MCP server for the Motion Atelier editor; runs on the user's computer and requires explicit pairing approval.
- `projects/ai-workspace/legacy-workspace-backup.html` — archived workspace backup, not the current app.

## Internal systems

- MAT-CORE is a separate private repository; its source and credentials are not published here.
- MATUDI AI Engine is a server-side API; requests require a Bearer token.

## Project quality

- [Project inventory](docs/PROJECT-INVENTORY.md)
- [Cross-project quality audit and release order](docs/quality/PROJECT-QUALITY-AUDIT.md)
- [Xi Workspace design audit](docs/quality/XI-WORKSPACE-AUDIT.md) — draft branch until visual and end-to-end tests pass.

## Principles

- Keep each project independent and preserve its identity.
- Track source code and changes in GitHub.
- Deploy web projects through Vercel when ready.
- Use Supabase only where a project needs backend services.
- Never commit provider keys, owner passwords or server tokens.
- A successful deployment is not proof that every feature has passed end-to-end testing.
