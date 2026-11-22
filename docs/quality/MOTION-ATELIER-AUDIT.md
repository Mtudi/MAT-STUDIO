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

Playwright tests exercise WebGL initialization with SwiftShader, custom clip save/export/import, invalid clip rejection, persistence after reload, keyboard playback, bridge panel open state and mobile overflow. Real VRM/VRMA assets and an actual local MCP client remain manual compatibility checks.
