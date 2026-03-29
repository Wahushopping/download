#!/usr/bin/env bash

echo "🚀 Installing yt-dlp..."
pip3 install -U yt-dlp

echo "🚀 Downloading ffmpeg..."

curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz

tar -xvf ffmpeg.tar.xz

mv ffmpeg-*-amd64-static ffmpeg-bin

chmod +x ffmpeg-bin/ffmpeg
chmod +x ffmpeg-bin/ffprobe

export PATH=$PWD/ffmpeg-bin:$PATH

echo "✅ ffmpeg ready"
