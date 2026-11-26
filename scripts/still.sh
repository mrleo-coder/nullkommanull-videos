#!/bin/sh
# Preview one frame: scripts/still.sh <Comp> <props.json> <frame> <out.png>
cd "$(dirname "$0")/.." && npx remotion still remotion/src/index.ts "$1" "$4" --props="$2" --frame="$3" --browser-executable=/usr/bin/google-chrome --chrome-mode=chrome-for-testing --log=error
