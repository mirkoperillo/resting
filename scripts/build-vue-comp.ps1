
$COMPONENTS_FOLDER="src/js/app/components"
$DIST_FOLDER="src/js/vendor/vue-stuff"
$CLI_PATH="node_modules/.bin"

# APPS
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name dialogs-app  "$COMPONENTS_FOLDER/apps/DialogsApp.vue"

# # COMPONENTS
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name clipboard-button  "$COMPONENTS_FOLDER/ClipboardButton.vue"
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name add-folder-button  "$COMPONENTS_FOLDER/AddFolderButton.vue"
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name bookmarks-menu  "$COMPONENTS_FOLDER/BookmarksMenu.vue"
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name response-menu  "$COMPONENTS_FOLDER/ResponseMenu.vue"
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name response-viewer  "$COMPONENTS_FOLDER/ResponseViewer.vue"
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name import-dialog  "$COMPONENTS_FOLDER/ImportDialog.vue"
& "$CLI_PATH/vue-cli-service.ps1" build --target lib --formats umd --dest $DIST_FOLDER --no-clean --name export-dialog  "$COMPONENTS_FOLDER/ExportDialog.vue"
