#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd $parent_path;
echo "Moved to scripts dir"

if [ $1 == 'chrome' ]
then
  echo "Build Chrome Extension"
else
  echo "Build Firefox Extension"
fi

if [ -d "../build" ]
then
  rm -r ../build
  echo "Removed build dir"
fi

mkdir ../build
echo "Created build dir"

cp -r ../src/* ../build
echo "Copied sources"

cd ..
./scripts/build-vue-comp.sh
echo "Built vue components"

cd scripts
if [ $1 == 'chrome' ]
then
  cp ../addon/chrome/* ../build
else  
  cp ../addon/firefox/* ../build
fi
echo "Copied webextension files"

echo "Done!"