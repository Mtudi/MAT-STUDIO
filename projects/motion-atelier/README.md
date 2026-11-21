# Motion Atelier — 3D Studio

A browser-based 3D character and animation editor.

## Features
- Three.js 3D viewport with orbit controls, grid and reference image controls.
- VRM / GLB / glTF / VRMA file loading.
- Built-in Idle, Walk, Wave, Sit and Dance clips.
- Custom clip creation, duplication, keyframe editing, easing, timeline scrubbing and playback speed.
- Custom animation clips are saved in this browser's local storage.
- Optional local MCP bridge with explicit pairing approval.

## Runtime
- Static HTML application; no hosted application backend is required.
- Three.js 0.169.0, @pixiv/three-vrm 3.0.0 and @pixiv/three-vrm-animation 3.0.0 are loaded from jsDelivr through the import map.
- Requires a modern browser with WebGL support.
- Imported character files are loaded in the browser. Custom clips are stored locally and are not cloud-synced.

## Local MCP bridge
The optional AI bridge connects to `ws://127.0.0.1:47821/motion-atelier-bridge`. It is not a hosted service. A compatible local bridge server must be running on the same computer. The app displays a pairing request and requires explicit approval before commands are accepted. If the local bridge is not running, the 3D editor continues to work without AI integration.

## Source of truth
This folder is the managed Vercel/GitHub deployment copy. The original root-level `Motion Atelier 3D Studio.html` is preserved unchanged as the historical source snapshot.
