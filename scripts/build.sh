#!/bin/sh

if [ ! -d "../dist" ] 
then
  mkdir ../dist
fi

if [ -e ../dist/resting.xpi ]
then
 rm ../dist/resting.xpi
fi

cd ..
./scripts/build-vue-comp.sh
echo "vue components built"

cd src
zip -r ../dist/resting.xpi *
cd ..
zip dist/resting.xpi LICENSE README.md
