#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js from https://nodejs.org and run this file again."
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Installing Merriday. The first launch can take a minute."
  npm install || exit 1
fi
if [ ! -f .next/BUILD_ID ]; then
  echo "Building Merriday. The first launch takes a minute. Opening it after that is quick."
  npm run build || exit 1
fi
echo "Merriday will open at http://127.0.0.1:43123"
echo "Leave this window open. Closing it stops Merriday."
(sleep 1 && (command -v xdg-open >/dev/null && xdg-open "http://127.0.0.1:43123" || open "http://127.0.0.1:43123")) >/dev/null 2>&1 &
npm run start
