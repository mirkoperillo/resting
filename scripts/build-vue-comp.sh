#!/bin/sh

COMPONENTS_FOLDER="src/js/app/components"
DIST_FOLDER="src/js/vendor/vue-stuff"
CLI_PATH="node_modules/.bin"

# APPS
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name dialogs-app  ${COMPONENTS_FOLDER}/apps/DialogsApp.vue

# COMPONENTS
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name clipboard-button  ${COMPONENTS_FOLDER}/ClipboardButton.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name r-dialog  ${COMPONENTS_FOLDER}/RDialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name donate-dialog  ${COMPONENTS_FOLDER}/DonateDialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name credits-dialog  ${COMPONENTS_FOLDER}/CreditsDialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name about-dialog  ${COMPONENTS_FOLDER}/AboutDialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name folder-dialog  ${COMPONENTS_FOLDER}/FolderDialog.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name sort-button  ${COMPONENTS_FOLDER}/SortButton.vue
${CLI_PATH}/vue-cli-service build --target lib --formats umd --dest ${DIST_FOLDER} --no-clean --name add-folder-button  ${COMPONENTS_FOLDER}/AddFolderButton.vue