#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd $parent_path;
echo "Moved to scripts dir"

if [ ! -d "../dist" ] 
then
  mkdir ../dist
fi

if [ ! -d "../dist" ] 
then
  mkdir ../dist
fi

if [ -e ../dist/resting.zip ]
then
 rm ../dist/resting.zip
fi

cd ..
./scripts/build-vue-comp.sh
echo "vue components built"

cd src
zip -r ../dist/resting.zip *
cd ..
if [ $1 == 'chrome' ]
then
  echo "copy chrome manifest"
  zip -j dist/resting.zip addon/chrome/*
else
  echo "copy firefox manifest"
  zip -j dist/resting.zip addon/firefox/*
fi

zip dist/resting.zip LICENSE README.md

echo "Done!"