# MAT-STUDIO

MAT-STUDIO is the public source hub for Matudi's independent digital products and experiments.

**Public project showcase:** https://sharable.link/jfi5b0ql

## Web experiences

- [Xi Personal AI](https://mat-studio.vercel.app/) — owner-authenticated personal AI workspace.
- [MATUDI AI Workspace](https://mat-studio.vercel.app/projects/ai-workspace/index.html) — guest chat, streaming and optional cloud sync.
- [MATUDI Chess Lab](https://mat-studio.vercel.app/projects/chess-lab/index.html) — legal chess practice, opening lines and FEN/PGN tools.
- [MATSONG](https://mat-studio.vercel.app/projects/matsong/index.html) — local music library and Spotify embeds.
- [MATUDI DEUTSCH](https://mat-studio.vercel.app/projects/deutsch/index.html) — German A1 starter learning.
- [MATUDI Christmas](https://mat-studio.vercel.app/projects/christmas/index.html) — interactive greeting-card creator.
- [MATUDI Portfolio](https://mat-studio.vercel.app/projects/portfolio/index.html) — personal portfolio.
- [Motion Atelier 3D Studio](https://mat-studio.vercel.app/Motion%20Atelier%203D%20Studio.html) — browser-based 3D character and animation studio.

## Experiments and local tools

- `experiments/xi-chatgpt-edition/` — archived multi-provider Xi and OpenAI/ChatGPT editions; they require the viewer's own provider key where applicable.
- `projects/matsong-next/` — separate development branch experiment for music discovery and Spotify Web Playback.
- `bridge/` — local MCP server for the Motion Atelier editor; runs on the user's computer and requires explicit pairing approval.
- `projects/ai-workspace/legacy-workspace-backup.html` — archived workspace backup, not the current app.

## Internal systems

- MAT-CORE is a separate private repository; its source and credentials are not published here.
- MATUDI AI Engine is a server-side API; requests require a Bearer token.

## Principles

- Keep each project independent and preserve its identity.
- Track source code and changes in GitHub.
- Deploy web projects through Vercel when ready.
- Use Supabase only where a project needs backend services.
- Never commit provider keys, owner passwords or server tokens.
- A successful deployment is not proof that every feature has passed end-to-end testing.
