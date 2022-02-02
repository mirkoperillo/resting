#!/bin/sh

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
zip dist/resting.zip LICENSE README.md
