#!/bin/bash
cd data/molfiles
FILES=$(ls *_can.mol)
rm -f ../set2dcan.sdf
for f in $FILES
do
  echo "Processing $f file..."
  # take action on each file. $f store current file name
  y=${f%_can.mol}
  echo -e ">\t<entryID>\n${y##*/}\n\n\$\$\$\$" > ../id.txt
 # echo "" >> ../id.txt
  cat $f ../id.txt >> ../set2dcan.sdf
done

rm ../id.txt