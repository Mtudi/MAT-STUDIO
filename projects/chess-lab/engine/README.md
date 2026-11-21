# Stockfish.js engine files

MATUDI Chess Lab loads the **Stockfish.js 19.0.1 lite, single-threaded** engine on demand in a Web Worker.

The worker and matching WebAssembly file are served from the pinned npm package through Vercel rewrites:
- `stockfish-19-lite-single.js`
- `stockfish-19-lite-single.wasm`

Upstream source: https://github.com/nmrugg/stockfish.js/tree/v19.0.1
Underlying engine: https://github.com/official-stockfish/Stockfish
License: GNU GPL version 3. The complete license text is in this folder's `COPYING.txt`.

The lite single-threaded build is approximately 1.8 MB, runs without cross-origin isolation headers, and is downloaded only when the user starts an analysis. The engine runs locally in the browser; positions are not sent to a chess-analysis server.

Stockfish.js is a separate third-party program. It is not modified or bundled into the Chess Lab JavaScript.
