#!/bin/bash

filename=$1 

echo $filename

awk -v prefix=${filename%.txt} '

BEGIN {
  suffix = ".txt"
  block = 1
  outf = prefix "_" block suffix
  head = "";
}
# write lines to named output file
{
	if (head=="") {head=$0};
	print $0 >outf;
	nmol++;
}
nmol >= 200 {
    close (outf);
    block++;
    outf = prefix "_" block suffix;
    print head > outf;
    nmol = 0;
}
' < "$filename"
