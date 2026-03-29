#!/usr/bin/env bash

echo "🚀 Installing ffmpeg..."
apt-get update
apt-get install -y ffmpeg python3-pip

echo "🚀 Installing yt-dlp..."
pip3 install -U yt-dlp

echo "✅ Build complete"
