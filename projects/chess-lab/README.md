# MATUDI Chess Lab

A browser-based chess study board with legal move validation powered by `chess.js`.

## Features

- Legal move generation, move history, undo, reset, board flip and promotion.
- FEN loading/copying and PGN import/export.
- Move-by-move position review with a one-click return to the live game.
- Saved local game restoration and private local study notes.
- Four opening study lines across the London System and Caro-Kann.
- Optional Stockfish 19 lite single-threaded analysis in a Web Worker. The engine is downloaded only when analysis is requested and runs locally in the browser; game positions are not sent to an analysis API.
- Stop control, clear engine error states, reduced-motion support and keyboard focus styling.

## Engine delivery

The engine is the unmodified `stockfish@19.0.1` lite single-threaded browser build. The matching JavaScript and WebAssembly files are served from the pinned npm release through Vercel rewrites, preferring unpkg with jsDelivr as a local smoke-server fallback. Both files must be available from the same `/engine/` path; the WASM response must use `application/wasm`.

The engine is licensed under GPL-3.0. The complete license text and upstream source details are in `engine/COPYING.txt` and `engine/README.md`.

The lite engine is smaller than the full Stockfish build and uses a reduced neural network. Analysis strength is therefore lower than the full engine, but it is appropriate for personal browser-based study. It is not a bot opponent and should not be used during rated games.

## Verification

GitHub Actions runs:
- Static HTML/JavaScript and JSON validation.
- A Playwright Chromium smoke test covering legal moves, move review, PGN import/export, opening presets, Stockfish UCI/WASM initialization, and a 390px mobile viewport.

A successful CI run verifies the local browser flow. A Vercel preview is still required to validate the production rewrite routes and public access.

## Privacy and storage

Games and notes are stored in the current browser's local storage. They are not cloud-synced between devices.
