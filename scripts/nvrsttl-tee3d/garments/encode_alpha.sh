#!/bin/bash
# encode_alpha.sh <frames-dir> <out-id>: transparent WebM turn + transparent poster for the dark stage
F=$1; ID=$2; D=/home/user/higgs/public/drop/media
ffmpeg -v error -y -framerate 30 -i $F/f_%03d.png -vf "crop=600:600:60:40,scale=720:720:flags=lanczos" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 33 -row-mt 1 -auto-alt-ref 0 $D/$ID.webm
ffmpeg -v error -y -i $F/f_000.png -vf "crop=600:600:60:40,scale=720:720:flags=lanczos" $D/$ID.png
echo "$ID $(du -k $D/$ID.webm | cut -f1)KB"
