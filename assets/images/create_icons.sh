#!/bin/bash
# Create a simple 1024x1024 icon using ImageMagick
convert -size 1024x1024 xc:'#4285F4' \
  -gravity center \
  -pointsize 400 \
  -fill white \
  -font Arial-Bold \
  -annotate +0+0 'ST' \
  icon.png

# Create favicon as 512x512
convert -size 512x512 xc:'#4285F4' \
  -gravity center \
  -pointsize 200 \
  -fill white \
  -font Arial-Bold \
  -annotate +0+0 'ST' \
  favicon.png

echo "Icons created successfully"
