# MAT-STUDIO Product Quality Roadmap
Updated: 2026-11-19
Repository: Mtudi/MAT-STUDIO
Production site: https://mat-studio.vercel.app/

## Operating standard

Every project is evaluated against the strongest products in its own category, not against one shared visual template. The goal is a reliable, coherent, useful product—not a larger line count. New code is justified by a user-facing capability, reliability, accessibility, maintainability, or measurable performance improvement.

Scores are not assigned until the relevant flows have been tested. Any later score must identify the rubric, test coverage, and evidence; it is not an official competitor score.

## Repository audit — verified from main

The repository currently contains 21 tracked files: 7 project pages, the MAT-STUDIO dashboard, the Xi chat workspace, 2 API files, and documentation/readmes. The apps are predominantly standalone HTML/CSS/JS pages with no shared frontend build/test pipeline.

### Current verified gaps

- Chess Lab: the previous board moved any selected piece to any destination. It did not validate chess legality, castling, en passant, promotion, check, checkmate, or draws; it had no engine.
- Deutsch: 12 hard-coded vocabulary cards with reveal/next only. No CEFR curriculum, spaced repetition, audio, pronunciation, exercise variety, progress, or durable learner profile.
- Christmas: recipient/message text composer and copy action only. No card editor, templates, preview export, shareable card URL, or saved designs.
- Portfolio: generic profile copy and links to three projects; no detailed case studies, evidence, contact flow, CV, or project outcomes.
- Xi landing page: a static project introduction. It is separate from the Xi chat workspace and does not itself provide assistant functionality.
- Xi Workspace: a working chat UI/API with local conversation storage and optional Supabase sync. It still needs stronger rate limiting/abuse controls, robust provider fallback, streaming, message search, file workflows, citations/research tools, evaluation and accessibility testing. Never expose secrets in browser code.
- MATSONG: local audio library/player with IndexedDB, queue/shuffle/repeat/favorites and a Spotify embed/auth experiment. The Spotify embed is not the same as a licensed, fully native streaming catalogue. Expand metadata/artwork, library management, queue behavior, search, keyboard/accessibility and resilient storage.
- MAT-STUDIO dashboard: project launch/search/pins/recent/quick actions are present, but pin/recent data is local to one browser, some status/stat labels are static, and there is no verified live health aggregation across apps.

## Competitor benchmark map

| MAT-STUDIO product | Primary benchmark set | Product capabilities to study |
|---|---|---|
| Chess Lab | Chess.com, Lichess, Chessable | Legal play, engine analysis, PGN/FEN, opening explorer, studies, puzzles, review, progress |
| Xi Workspace | ChatGPT, Claude, Gemini | Conversation quality, streaming, files, research/citations, tools, memory/project context, connectors, safety |
| MATSONG | Spotify, Apple Music, YouTube Music | Discovery, metadata/artwork, library, playlists, queue, player controls, accessibility, device behavior |
| Deutsch | Duolingo, Babbel, Busuu | CEFR path, spaced repetition, listening, speaking, grammar, review, progress |
| Portfolio | Framer, Webflow, leading personal portfolios | Case-study storytelling, proof of work, responsive design, SEO, performance, contact |
| Christmas | Canva, Paperless Post, Greetings Island | Templates, visual editor, preview, personalization, share links, export |
| MAT-STUDIO | Apple, Linear, Notion, Vercel | Hierarchy, speed, command palette, workspace search, status integrity, keyboard access, cross-device sync |
| Xi project page | Leading AI product landing pages | Clear positioning, live demo, trust, product roadmap, integrations and onboarding |

## Implementation progress — 2026-11-19\n\n- Chess Lab v1 committed: legal move validation via chess.js 1.4.0, legal move highlighting, move history, undo, reset, board flip, promotion, game-end state, PGN/FEN copy/load, and starter London/Caro-Kann lines. Stockfish analysis, tactical puzzles, opening explorer, cloud accounts and online play remain future work.\n- Deutsch v1 committed: 30 A1 starter words, flashcards, German browser speech synthesis, active-recall typing practice, local progress, and interval-based review scheduling. Full CEFR A1 curriculum, listening comprehension, grammar exercises, pronunciation assessment and cloud sync remain future work.\n- Christmas Studio v1 committed: three visual themes, live personalized preview, recipient/message/sender fields, shareable encoded card URL, native share/copy-link and print layout. A full template gallery, image export and saved-card library remain future work.\n- Roadmap document added to repository. Production deployment verification is tracked separately; a READY build alone does not prove every interactive flow has passed browser testing.\n\n## Delivery sequence

### Phase 1 — Chess Lab foundation
- Replace free-form piece movement with a tested legal chess rules library.
- Add move history, undo, reset, board flip, promotion, game-end states, PGN/FEN import/export.
- Add London System and Caro-Kann study lines.
- Next: Stockfish worker analysis, evaluation bar, best lines, game review, opening repertoire and tactics.
- Tests: illegal moves rejected; castling/en-passant/promotion work; checkmate/stalemate/draw states; PGN/FEN round trips; mobile board and keyboard/screen-reader behavior.

### Phase 2 — Xi Workspace
- Test API and Supabase sync end-to-end; add rate limiting, request budgets and abuse controls.
- Add reliable streaming, conversation search, file workflows, citations and provider error/fallback UX.
- Add repeatable quality/evaluation tests for factuality, tool use, prompt injection and error handling.
- Keep API credentials server-side only.

### Phase 3 — MATSONG
- Audit playback, IndexedDB, object URL cleanup, import edge cases, queue and Spotify OAuth lifecycle.
- Improve search/filter/sort, editable metadata, artwork, playlists, keyboard controls and mobile player.
- Clearly distinguish local files from Spotify's embedded player and API entitlements.

### Phase 4 — Deutsch
- Build A1 → A2 → B1 CEFR curriculum with units, goals and placement.
- Add spaced repetition, listening/audio, typed answers, grammar, sentence construction and progress history.
- Add accurate pronunciation audio and accessibility; do not fabricate pronunciation scoring.

### Phase 5 — Portfolio and Christmas
- Portfolio: real project case studies, role, problem, decisions, screenshots, outcomes, GitHub/live links, contact and downloadable CV if supplied.
- Christmas: template gallery, visual editor, personalization, shareable card pages and export.

### Phase 6 — MAT-STUDIO command center and Xi project page
- Add honest live project health/status, unified search and cloud-synced pins/recent state where appropriate.
- Improve keyboard navigation, responsive layouts, focus visibility, contrast and performance.
- Clarify the distinct purpose of Xi's project landing page versus the Xi Workspace app.

## Release gates

1. Inspect the exact current source before editing.
2. Keep each app's own visual identity and preserve existing working features.
3. Test core flows and mobile layout before release.
4. Verify the exact Vercel deployment commit, READY state, production alias, HTTP response and rendered content.
5. Report completed work separately from planned work. Never use line count as a quality score.
