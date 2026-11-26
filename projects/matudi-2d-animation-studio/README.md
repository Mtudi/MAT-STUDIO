# MATUDI 2D Animation Studio

A local-first browser workspace for building short 2D character performances.

## Current build

- SVG character stage with editable transform, expression, mouth opening and arm pose.
- Keyframe tracks for transform, face and motion.
- Timeline scrubbing, playback, frame stepping, loop and easing presets.
- Wave, walk, nod and idle motion-key presets.
- Local audio import and playback.
- Background image import.
- Save to browser storage; export/import editable JSON projects.
- Export current frame as SVG or PNG.
- Keyboard shortcuts and responsive inspector panels.
- No advertising, analytics, account requirement or server-side asset upload.

## Open

Open `index.html` in a modern browser, or visit the Vercel deployment when configured.

## Shortcuts

| Key | Action |
|---|---|
| Space | Play / pause |
| K | Add keyframe |
| ← / → | Previous / next frame |
| Shift + ← / → | Step 10 frames |
| V | Select tool |
| G | Move tool |
| B | Bone overlay |
| P | Draw / import tool |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |

## Honest scope

This is an early editor build, not a replacement for Moho or Toon Boom yet. The bone tool currently displays a rig guide; full bone authoring, mesh deformation, phoneme recognition, and video encoding are not implemented in this build. Audio playback is local, while lip-sync poses can be keyed manually.