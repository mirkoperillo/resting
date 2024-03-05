#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd $parent_path;
echo "Moved to scripts dir"

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

# patch the manifest
mkdir -p dist/tmp
if [ $? -eq 0 ]; then
  echo "created tmp folder"
fi

if [ $1 == 'chrome' ]
then
  cp addon/chrome/* dist/tmp/
  echo "copy chrome manifest"
else
  cp addon/firefox/* dist/tmp/ 
  echo "copy firefox manifest"
fi


# copy sources
cd src
cp -R * ../dist/tmp
if [ $? -eq 0 ]; then
  echo "copy src in tmp folder"
else
  echo "error copying src folder"
  exit -1
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/^}/,"applications": {\n\t"gecko": {\n\t\t"id": "resting@owlcode.eu"\n\t}\n}\n}/g' ../dist/tmp/manifest.json
else
  sed -i 's/^}/,"applications": {\n\t"gecko": {\n\t\t"id": "resting@owlcode.eu"\n\t}\n}\n}/g' ../dist/tmp/manifest.json
fi

if [ $? -eq 0 ]; then
  echo "editing manifest.json"
else
  echo "error editing manifest"
  exit -1
fi
cd ../dist/tmp
echo "move to folder $(pwd)"
zip -rq ../resting-unsigned.xpi *
cd ../..
zip -q dist/resting-unsigned.xpi LICENSE README.md
if [ $? -eq 0 ]; then
  echo "creating xpi file"
else
  echo "error creating xpi file"
fi
rm -Rf dist/tmp
if [ $? -eq 0 ]; then
  echo "delete tmp folder"
else
  echo "error deleting tmp folder"
fi

echo "Done!"