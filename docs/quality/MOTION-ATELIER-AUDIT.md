# Motion Atelier — Release Audit

Updated: 2026-11-22

## Upgrade

- Preserve the standalone 3D editor and local MCP bridge workflow.
- Add export/import for custom animation clip packs in portable JSON.
- Validate imported clip names, duration, supported bone tracks, three-axis keyframe values, easing modes, file size, clip count and total keyframe count.
- Save imported clips to the existing `ma.c` local-storage key.
- Add accessible status regions, control labels, timeline keyboard focus and responsive clip-pack controls.

## Data boundaries

- Clip packs contain custom keyframe data only; character model files and native VRMA clips are not bundled.
- Custom clips remain in local browser storage unless explicitly exported.
- The MCP bridge stays loopback-only and requires explicit pairing approval; no public network exposure is introduced.

## Verification

Playwright tests pass with WebGL/SwiftShader: scene and built-in clips initialize; keyboard playback works; custom clips save/export/import; reserved names and invalid keyframes are rejected; imported clips persist after reload; bridge panel opens without auto-connecting; and the 390px mobile viewport has no horizontal overflow. Public preview: https://sharable.link/d3i3ewiy. Real VRM/VRMA assets and an actual local MCP client remain manual compatibility checks. The sharable preview does not receive an added localhost bridge origin; keep the existing bridge allowlist and verify pairing only from an approved app origin.
