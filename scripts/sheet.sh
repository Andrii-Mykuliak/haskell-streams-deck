#!/bin/bash
# sheet.sh out.png img1 img2 img3 img4  -> 2x2 grid
out=$1; shift
args=(); for f in "$@"; do args+=(-i "$f"); done
n=$#
while [ $n -lt 4 ]; do args+=(-f lavfi -i color=black:s=960x540); n=$((n+1)); done
ffmpeg -loglevel error -y "${args[@]}" -filter_complex "[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0" -frames:v 1 "$out"
