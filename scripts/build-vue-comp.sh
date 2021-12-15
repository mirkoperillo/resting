#!/bin/sh

COMPONENTS_FOLDER="src/js/app/components"
DIST_FOLDER="src/js/vendor/vue-stuff"
CLI_PATH="node_modules/.bin"


${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name clipboard-button  ${COMPONENTS_FOLDER}/clipboard-button.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name r-dialog  ${COMPONENTS_FOLDER}/r-dialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name donate-dialog  ${COMPONENTS_FOLDER}/donate-dialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name credits-dialog  ${COMPONENTS_FOLDER}/credits-dialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name about-dialog  ${COMPONENTS_FOLDER}/about-dialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name folder-dialog  ${COMPONENTS_FOLDER}/folder-dialog.vue