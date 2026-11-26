# MAT-STUDIO

MAT-STUDIO is the public source hub for Matudi's independent digital products and experiments.

**Public project showcase:** https://sharable.link/jfi5b0ql

## Web experiences

- [Xi Personal AI](https://mat-studio.vercel.app/) — owner-authenticated personal AI workspace.
- [MATUDI AI Workspace](https://mat-studio.vercel.app/projects/ai-workspace/index.html) — guest chat, streaming and optional cloud sync.
- [MATUDI Chess Lab](https://mat-studio.vercel.app/projects/chess-lab/index.html) — legal chess practice, opening lines and FEN/PGN tools.
- [MATSONG interactive preview](https://sharable.link/89k1u749) — local music library and Spotify embeds.
- [MATUDI DEUTSCH A1 preview](https://sharable.link/t5cevsdg) — German A1 starter learning.
- [MATUDI Christmas](https://mat-studio.vercel.app/projects/christmas/index.html) — interactive greeting-card creator.
- [MATUDI Portfolio](https://mat-studio.vercel.app/projects/portfolio/index.html) — personal portfolio.
- [Pixel Fire — Fire Lab](https://mat-studio.vercel.app/projects/pixel-fire/web/index.html) — interactive pixel-fire simulation with automatic flame motion and live controls.
- [Motion Atelier 3D Studio](https://mat-studio.vercel.app/Motion%20Atelier%203D%20Studio.html) — browser-based 3D character and animation studio.
- [Motion Atelier Open-Source Toolchain](https://mat-studio.vercel.app/motion-toolchain.html) — ten specialist tools, verified interchange paths and integration roadmap. [Live preview](https://sharable.link/jf22dpsr).
- [BUGATTI — Pour l'Éternité](https://sharable.link/vax7b4wr) — independent Bugatti Tourbillon concept with cinematic storytelling and interactive visual customization.

## Experiments and local tools

- experiments/xi-chatgpt-edition/ — archived multi-provider Xi and OpenAI/ChatGPT editions; they require the viewer's own provider key where applicable.
- projects/matsong-next/ — separate development branch experiment for music discovery and Spotify Web Playback.
- bridge/ — local MCP server for the Motion Atelier editor; runs on the user's computer and requires explicit pairing approval.
- projects/ai-workspace/legacy-workspace-backup.html — archived workspace backup, not the current app.

## Internal systems

- MAT-CORE is a separate private repository; its source and credentials are not published here.
- MATUDI AI Engine is a server-side API; requests require a Bearer token.

## MATUDI PES — Professional Execution Standard

- [Standard](docs/MATUDI-PES/STANDARD.md) — mandatory baseline for all projects.
- [Project starter](docs/MATUDI-PES/PROJECT-STARTER.md) — pre-flight, implementation, and delivery checklist.
- [Project brief template](docs/MATUDI-PES/PROJECT-BRIEF-TEMPLATE.md) — define each project's vision and acceptance criteria.
- [Quality gates](docs/MATUDI-PES/QUALITY-GATES.md) — operational five-layer QA process.
- [Changelog](docs/MATUDI-PES/CHANGELOG.md) — versioned record of improvements.

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
