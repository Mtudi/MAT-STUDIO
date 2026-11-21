# MATUDI Project Quality Audit
Last audited: 2026-11-21
Scope: public `MAT-STUDIO` source, private `MAT-CORE` engine source, Vercel project settings, and the connected Xi Supabase project.

## Verified project inventory

### Current web experiences
| Project | Source | Current verified scope | Main quality gap |
|---|---|---|---|
| Xi Personal AI | root `index.html` | Owner-authenticated assistant; server-side engine bridge | Needs a focused design/keyboard/mobile regression pass |
| Xi AI Workspace | `projects/ai-workspace/index.html` | Guest chat, streaming, local history, optional Supabase sync | Welcome screen had stale provider copy; redesign is in draft PR #3 |
| MATUDI Chess Lab | `projects/chess-lab/index.html` | Legal move handling via chess.js, FEN/PGN copy, London and Caro-Kann starter lines | No engine analysis, PGN import, game review or accessibility pass |
| MATSONG | `projects/matsong/index.html` | Local audio library in IndexedDB, queue/favorites, Spotify embeds and PKCE profile connection | Fixed a real inline-script syntax bug; hosted preview disables Spotify account sign-in |
| MATUDI DEUTSCH | `projects/deutsch/index.html` | Main branch has the 30-word starter deck. PR #7 adds an Arabic-supported 8-unit A1 path, 71 words, listening/reading checks, writing/speaking models and a 60-minute routine. Preview: https://sharable.link/t5cevsdg | Validate progress migration, answer keys, browser speech fallback and mobile layout before merging |
| MATUDI Christmas | `projects/christmas/index.html` | Interactive greeting card, share URL and print | Needs saved drafts, image export and accessibility |
| MATUDI Portfolio | `projects/portfolio/index.html` | Static personal portfolio | Needs verified project case studies, screenshots and contact workflow |
| Motion Atelier 3D Studio | `Motion Atelier 3D Studio.html` | Three.js 3D editor, clips/keyframes and local bridge integration | Needs export workflow, mobile/accessibility testing and bridge end-to-end test |

### Experiments and local tools
- `projects/matsong-next/` on branch `matsong-next`: separate music discovery / Spotify Web Playback experiment; not promoted to the current MATSONG release.
- `experiments/xi-chatgpt-edition/index.html`: archived multi-provider Xi prototype with local video-file analysis.
- `experiments/xi-chatgpt-edition/gemini-original.html`: archived OpenAI API-key edition.
- Root `index (3).html` is byte-identical to the archived multi-provider Xi file; it is a duplicate, not another product.
- `bridge/server.mjs`: local Motion Atelier MCP server. It binds to loopback and requires a pairing code and explicit approval.
- `IM MAT Chess Arena`: separate Vercel deployment, not found in the current MAT-STUDIO GitHub tree.
- `projects/ai-workspace/legacy-workspace-backup.html`: archive only.
- `templates/README.md`: placeholder; no template assets found.

### Repository audit
- `Mtudi/MAT-STUDIO`: public source hub containing the eight current web experiences above.
- `Mtudi/MAT-CORE`: private internal library and AI Engine source; do not expose.
- `Mtudi/matudi-ai-workspace`: private repository with no deployable app source at audit time.
- `Mtudi/Mat`: public repository with no deployable app source at audit time.
- No standalone MAT-STUDIO Command Center source was found in the current main tree. The previous roadmap entry was corrected rather than inventing a project.

## Security and infrastructure checks

### Vercel
- Production protection for `mat-studio` and `matudi-ai-engine` is set to public production / protected previews.
- The Xi owner endpoints retain session validation; the AI Engine endpoint requires a constant-time checked Bearer token and validates project/message payloads.
- The daily Vercel API deployment quota was reached during this work. Source fixes can be merged and preview pages hosted separately, but a new Vercel build must wait for quota availability.
- A `READY` deployment is not treated as proof that its application flows work.

### Supabase — Xi Workspace project
- Project is active and healthy.
- `ai_conversations` RLS policy requires `auth.uid() = user_id` for both USING and WITH CHECK.
- `ai_messages` policy requires the parent conversation to belong to `auth.uid()` for both USING and WITH CHECK.
- The anonymous-access advisor warnings are expected because guest sign-ins use Supabase's authenticated role; ownership checks were verified and prevent cross-user access.
- Performance and health advisors returned no findings.
- Leaked-password protection is disabled; current app email sign-in uses magic links rather than password login, so this is a low-priority configuration item, not a blocker for the guest flow.

### GitHub quality checks
- Added `.github/workflows/quality.yml` and `scripts/check-static-html.mjs`.
- CI checks duplicate HTML IDs and parses inline JavaScript in tracked HTML files.
- The workflow passed on the MATSONG repair PR after it found and helped fix three literal `\\n` sequences (one broke JavaScript parsing; two leaked into page markup).

## Work completed
1. Published the public MATUDI Projects Hub: https://sharable.link/jfi5b0ql
2. Published a MATSONG interactive preview: https://sharable.link/89k1u749
3. Published the Arabic-supported Deutsch A1 course preview: https://sharable.link/t5cevsdg; PR #7 contains the source upgrade.
3. Corrected the public Motion Atelier bridge origin and setup instructions.
4. Corrected the project inventory, root README and archived Xi classifications.
5. Added static HTML/JavaScript CI and fixed the MATSONG syntax issue.
6. Prepared the Xi Workspace design pass in draft PR #3, preserving existing chat, auth, storage and Modo behavior.

## Release order
1. **Xi Workspace design** — finish responsive visual review and end-to-end guest/owner/cloud-sync checks before merging PR #3.
2. **Chess Lab** — PR #6 adds local Stockfish analysis, PGN import/export, move review and a four-line London/Caro-Kann repertoire; deploy and test the worker/WASM handshake before merging.
3. **MATSONG** — deploy the fixed source to Vercel when the deployment quota allows; then re-enable and verify Spotify PKCE on the official redirect URI.
4. **Motion Atelier** — verify the public page to local MCP bridge pairing and add a reliable export path.
5. **Deutsch** — validate and merge PR #7 after browser/mobile tests, then deploy the 8-unit A1 preview.
6. **Christmas** — add draft persistence and shareable image export.
7. **Portfolio** — build evidence-based case studies from actual project work; do not invent results or credentials.

## Release rule
No project is marked complete solely because its HTML exists or a deployment is READY. Each feature needs a real browser test, error-state test, mobile check and security review appropriate to its architecture.
