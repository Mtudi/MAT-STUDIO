# Golden Dome — Terminal Generative Art

A procedural, animated terminal artwork inspired by the golden dome of the Imam Hussain shrine in Karbala. Geometry, lighting, ornamental ribs, and the crescent finial are generated at runtime; no reference image is embedded.

## Requirements
- Python 3.10+
- NumPy

## Install and run

\`\`\`bash
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
# macOS / Linux:
source .venv/bin/activate

python -m pip install -r requirements.txt
python golden_dome.py
\`\`\`

Render a still frame:

\`\`\`bash
python golden_dome.py --static
\`\`\`

Optional sizing / speed:

\`\`\`bash
python golden_dome.py --width 120 --height 38 --fps 15
\`\`\`

Use a modern terminal with ANSI 24-bit color support. Press Ctrl+C to stop; the cursor is restored on exit. The render is intentionally capped at 220×90 cells for performance.

## Notes
This is an artistic procedural interpretation, not a measured architectural reconstruction. The onion profile, drum, ribs, ornamental bands, lighting, and crescent are mathematical geometry rendered as colored terminal characters.
