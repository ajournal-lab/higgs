#!/bin/bash
# Render each garment's 120-frame turn, put it on white, and encode it into the repo.
G=/tmp/claude-0/-home-user-higgs/e2b73ada-89b3-55e7-9c6a-740ec51cd777/scratchpad/garments
R=/home/user/higgs/public/nvrsttl/models
for g in boss-front-tee olive-tee black-polo navy-zip-polo boss-back-tee; do
  rm -rf $G/$g/frames
  TEE_DIR=$G/$g /home/user/blender-env/bin/python $G/build_tee.py -- 120 > $G/$g/render.log 2>&1
  n=$(ls $G/$g/frames 2>/dev/null | wc -l)
  if [ "$n" != "120" ]; then echo "FAILED $g ($n frames)"; continue; fi
  ffmpeg -v error -y -f lavfi -i color=white:s=720x720:r=30 -framerate 30 -i $G/$g/frames/f_%03d.png \
    -filter_complex "[0][1]overlay=format=auto:shortest=1,crop=600:600:60:40,scale=720:720:flags=lanczos" \
    -c:v libx264 -pix_fmt yuv420p -g 1 -crf 20 -movflags +faststart $R/$g-turntable.mp4
  ffmpeg -v error -y -i $R/$g-turntable.mp4 -frames:v 1 -q:v 3 $R/$g-poster.jpg
  echo "DONE $g"
done
echo ALL_FINISHED
