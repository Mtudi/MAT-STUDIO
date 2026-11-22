# MAT-STUDIO

MAT-STUDIO is the public source hub for MATUDI's independent digital products and experiments.

**Public project showcase:** https://sharable.link/jfi5b0ql

## Web experiences

- [Xi — Personal AI overview](https://sharable.link/9m2vmt6e) — public project overview; the live app requires owner access.
- [MATUDI Chess Lab](https://mat-studio.vercel.app/projects/chess-lab/index.html) — legal chess practice and opening study; Stockfish/PGN upgrade is in [PR #10](https://github.com/Mtudi/MAT-STUDIO/pull/10).
- [MATSONG — Crimson Edition](https://sharable.link/89k1u749) — local-first music player; Spotify Web Playback and migration upgrade is in [PR #12](https://github.com/Mtudi/MAT-STUDIO/pull/12).
- [MATUDI DEUTSCH A1](https://sharable.link/t5cevsdg) — Arabic-supported German A1 course with eight units.
- [MATUDI Christmas Studio](https://sharable.link/k2dhaohv) — personalized greeting cards, local drafts, Arabic-safe share links and PNG export.
- [MATUDI Portfolio](https://sharable.link/b7sur4cx) — responsive project showcase with filters and light/dark appearance.
- [Motion Atelier 3D Studio](https://sharable.link/d3i3ewiy) — browser-based 3D character and animation studio.
- [Motion Atelier Open-Source Toolchain](https://sharable.link/jf22dpsr) — ten specialist tools, verified interchange paths and integration roadmap.

## Active release candidates

- [PR #10 — Chess Lab](https://github.com/Mtudi/MAT-STUDIO/pull/10): Stockfish 19 lite, PGN import/export, move review and browser QA.
- [PR #11 — Xi Workspace](https://github.com/Mtudi/MAT-STUDIO/pull/11): onboarding/UI refresh, owner/origin security and API/browser QA.
- [PR #12 — MATSONG](https://github.com/Mtudi/MAT-STUDIO/pull/12): migration-safe local library, Spotify PKCE refresh, Premium Web Playback and embed fallback.
- [PR #13 — Christmas + Portfolio](https://github.com/Mtudi/MAT-STUDIO/pull/13): local card drafts, PNG export, Arabic-safe sharing and portfolio redesign.
- [PR #14 — Motion Atelier](https://github.com/Mtudi/MAT-STUDIO/pull/14): portable custom-clip JSON packs, validated import and accessibility improvements.
- [PR #15 — Xi public landing](https://github.com/Mtudi/MAT-STUDIO/pull/15): crimson product overview, owner-access clarity and responsive browser QA.

## Experiments and local tools

- `projects/ai-workspace/index.html` is a legacy Xi UI prototype, not the separate MATUDI AI Workspace project; it is preserved for reference.

- `experiments/xi-chatgpt-edition/` — archived multi-provider Xi and OpenAI/ChatGPT editions; provider-key modes require the viewer's own key where applicable.
- `projects/matsong-next/` — experimental source branch used as the basis for the canonical MATSONG release upgrade.
- `bridge/` — local MCP server for the Motion Atelier editor; runs on the user's computer and requires explicit pairing approval.
- `projects/ai-workspace/legacy-workspace-backup.html` — archived workspace backup, not the current app.

## Internal systems

- MATUDI AI Workspace is a separate private project, distinct from Xi. It is not currently published as a runnable public app.

- MAT-CORE is a separate private repository; its source and credentials are not published here.
- MATUDI AI Engine is a server-side API; requests require a Bearer token.

## Project quality

- [Project inventory](docs/PROJECT-INVENTORY.md)
- [Cross-project quality audit and release order](docs/quality/PROJECT-QUALITY-AUDIT.md)
- [MATSONG release audit](docs/quality/MATSONG-AUDIT.md)

## Principles

- Keep each project independent and preserve its identity.
- Track source code and changes in GitHub.
- Deploy web projects through Vercel when ready.
- Use Supabase only where a project needs backend services.
- Never commit provider keys, owner passwords or server tokens.
- A successful deployment is not proof that every feature has passed end-to-end testing.
- Keep private data private and label previews, experiments and production releases honestly.
