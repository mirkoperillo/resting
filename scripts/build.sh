#!/bin/sh

if [ ! -d "../dist" ] 
then
  mkdir ../dist
fi


cd ../src
tar czvf ../dist/resting.tgz * ../LICENSE ../README.md
