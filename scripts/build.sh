#!/bin/sh

if [ ! -d "../dist" ] 
then
  mkdir ../dist
fi



tar czvf ../dist/resting.tgz ../src/*
