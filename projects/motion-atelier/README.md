# Motion Atelier — 3D Studio

A standalone browser-based 3D character and motion workspace.

## Current workflow

- Load VRM characters, GLB/glTF models and VRMA motion files.
- Work with built-in motion presets, custom clips, a keyframe timeline, pose controls and optional face/physics features.
- Save custom clips in the current browser.
- Export and import validated JSON clip packs to move custom animation data between browsers.
- Connect the optional local MCP bridge only when the user explicitly starts it and approves pairing.

## Clip pack format

- Export includes custom clip durations, loop settings and keyframes; it does not include character model files or embedded native VRMA clips.
- Import accepts up to 100 clips and a 1 MB file, validates duration and bone names, limits total keyframes to 5,000, and accepts only known easing modes.
- Reserved property names and invalid/out-of-range keyframes are rejected.
- Imported clips merge into the current project under unique names and are saved in local storage when available.

## Local bridge safety

- The AI bridge is a loopback connection to a service on the user's own computer.
- It does not auto-connect. Pairing requires an explicit user action and an approval step in the app.
- Keep the local bridge process private; do not expose it to the public internet.

## Data and compatibility

- Custom clips are saved in browser local storage under `ma.c`.
- JSON clip packs are portable between browsers; character models must be loaded separately.
- The app loads Three.js and VRM modules from pinned jsDelivr versions.

## Verification

The Playwright browser suite checks WebGL initialization, built-in clips, keyboard playback, custom clip save/export, validated import, persistence after reload, bridge panel behavior and mobile layout. Real VRM/VRMA asset compatibility should still be checked with representative user files.
