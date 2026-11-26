#!/bin/sh
# One-time setup per fresh workspace: node deps, Piper TTS and a German voice.
set -e
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm install --silent --no-audit --no-fund
command -v piper >/dev/null || pip install --break-system-packages -q piper-tts
if [ ! -f assets/voice/de-thorsten-low.onnx ]; then
  mkdir -p assets/voice /tmp/nknvoice
  curl -sSL -o /tmp/nknvoice/v.tgz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
  tar xzf /tmp/nknvoice/v.tgz -C assets/voice
fi
echo "setup ok"
