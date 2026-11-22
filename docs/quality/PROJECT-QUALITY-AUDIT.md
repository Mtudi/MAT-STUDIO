# MATUDI Project Quality Audit
Last audited: 2026-11-22
Scope: public `MAT-STUDIO` source, private `MAT-CORE` engine source, Vercel project settings, and the connected Xi Supabase project.

## Verified project inventory

### Current web experiences
| Project | Source | Current verified scope | Main quality gap |
|---|---|---|---|
| Xi Personal AI | root `index.html` | Owner-authenticated assistant; server-side engine bridge | Needs a focused design/keyboard/mobile regression pass |
| Xi AI Workspace | `projects/ai-workspace/index.html` | Guest chat, streaming, local history and optional Supabase sync. PR #11 refreshes onboarding/layout, hardens origin and owner-code checks, and adds API plus Playwright CI; review is open. |
| MATUDI Chess Lab | `projects/chess-lab/index.html` | Main branch: legal moves, history, undo, promotion and FEN/PGN copy. PR #10 adds Stockfish 19 lite analysis, PGN import/download and move review. Playwright verifies UCI analysis, JS/WASM HTTP 200 and application/wasm MIME, plus mobile layout. | Latest Vercel preview is blocked by the 100-deployments/24h quota; production rewrite test remains pending |
| MATSONG | `projects/matsong/index.html` | PR #12 promotes a richer Crimson Edition to the canonical route, reuses the existing IndexedDB database, adds Spotify PKCE refresh, catalog search, Premium Web Playback and official embeds, and archives the previous HTML. Browser regression suite is running; real Premium playback awaits a fresh Vercel deployment. |
| MATUDI DEUTSCH | `projects/deutsch/index.html` | Main branch now has a 71-word Arabic-supported A1 path, 8 units, listening/reading checks, writing/speaking models, spaced review and a 60-minute routine. Static CI and Playwright desktop/mobile smoke tests passed. Preview: https://sharable.link/t5cevsdg | Validate progress migration, answer keys, browser speech fallback and mobile layout before merging |
| MATUDI Christmas | `projects/christmas/index.html` | PR #13 adds local draft save/restore/clear, Arabic-safe share links, shared-card mode, Canvas PNG export and accessibility/mobile refinements. Playwright browser checks are running. |
| MATUDI Portfolio | `projects/portfolio/index.html` | PR #13 replaces the conflicting CSS layers with a responsive light/dark portfolio, six evidence-based project cards, accessible filters and GitHub contact path. Playwright checks are running. |
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
- The daily Vercel API deployment quota was reached during this work (Vercel returned `api-deployments-free-per-day`, retry after 24 hours). Do not attempt more deployments or CLI workarounds. Source fixes and GitHub CI can continue; new Vercel builds must wait for quota availability.
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

| MATUDI AI Workspace (private) | `Mtudi/matudi-ai-workspace` | Read-only audit: repository contains only a 21-byte README; no source tree or build config. The 38-file archive is not present in the current Library. The separate project remains distinct from Xi. | Do not modify until explicit written approval and source recovery |

## Work completed
1. Published the public MATUDI Projects Hub: https://sharable.link/jfi5b0ql
2. Published a MATSONG interactive preview: https://sharable.link/89k1u749
3. Published the Arabic-supported Deutsch A1 course preview: https://sharable.link/t5cevsdg; PR #8 is merged.
4. Corrected the public Motion Atelier bridge origin and setup instructions.
5. Corrected the project inventory, root README and archived Xi classifications.
6. Added static HTML/JavaScript CI and fixed the MATSONG syntax issue.
7. Opened PR #10 for Chess Lab Stockfish/PGN upgrades; browser tests cover UCI/WASM and mobile.
8. Opened PR #11 for Xi Workspace UX/API security; static/API/browser checks are in CI.
9. Opened PR #12 for MATSONG migration-safe storage, Spotify integration and browser regression tests.
10. Opened PR #13 for the Portfolio redesign and Christmas Studio draft/PNG upgrades; browser checks pass.
11. Opened PR #14 for Motion Atelier clip-pack export/import and accessibility; WebGL browser checks are running.

## Release order
1. **Xi Workspace** — PR #11: verify guest/owner login, streaming and email/cloud sync on the deployed app after quota reset.
2. **Chess Lab** — PR #10: static and Playwright checks cover engine/WASM and mobile; verify Vercel rewrite paths after quota reset.
3. **MATSONG** — PR #12: browser tests cover DB migration, local playback, OAuth refresh and player requests; verify a real eligible Premium account after deployment.
4. **Christmas + Portfolio** — PR #13: browser tests pass for share/draft/PNG export, filtering, theme persistence and mobile; publish previews after quota reset.
5. **Motion Atelier** — PR #14 adds clip pack export/import; wait for WebGL browser tests, then verify real VRM/VRMA assets and local MCP pairing.
6. **Deutsch** — PR #8 is merged; validate German TTS voices on real Android devices and publish the latest production preview after quota reset.

## Release rule
No project is marked complete solely because its HTML exists or a deployment is READY. Each feature needs a real browser test, error-state test, mobile check and security review appropriate to its architecture.
