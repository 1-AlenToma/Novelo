import * as React from "react";
import { Modal, TouchableOpacity, Icon, Text, View, ProgressBar, useLoader, FileBrowser } from "../components";
import { FileHandler, ImageCache } from "../native";
import { FilesPath } from "../Types";




export default () => {
    context.hook("appSettings.filesDataLocation", "appSettings.filesDataLocation");
    const state = buildState({
        uri: context.appSettings.filesDataLocation ?? context.files.dir,
        progress: 0
    }).build();
    const loader = useLoader()

    const browse = async () => {
        let uri = await context.browser.pickFolder("Use new location for Novelo to save its data.")
        if (!uri || uri.path === context.appSettings.filesDataLocation) {
            return;
        }

        context.alert("We will begin moving the data to the new location").confirm(async (confirm) => {

            try {

                if (uri && confirm) {

                    loader.show();
                    let fileHandler = new FileHandler(uri.path.path(FilesPath.File), undefined, true);
                    let imageHandler = new ImageCache(uri.path.path(FilesPath.Images))
                    await fileHandler.checkDir();
                    await imageHandler.checkDir();
                    let files = await context.files.allFilesInfos(true);
                    let images = await context.imageCache.allFilesInfos(true);
                    state.progress = 0.1;
                    let total = files.length + images.length;
                    // writing Files
                    for (let i = 0; i < files.length; i++) {
                        let file = getFileInfo(files[i].path, context.files.dir);
                        await fileHandler.copy(files[i].path, file.filePath ?? files[i].name);
                        state.progress = total.procent(i);

                    }

                    // writing Images
                    for (let i = 0; i < images.length; i++) {
                        let file = getFileInfo(images[i].path, context.imageCache.dir);
                        await imageHandler.copy(images[i].path, file.filePath ?? images[i].name);
                        state.progress = total.procent(i + files.length);
                    }

                    await context.db().commitTransaction();
                    state.uri = context.appSettings.filesDataLocation = uri.path;
                    await context.appSettings.saveChanges();
                    context.imageCache = imageHandler;
                    context.files = fileHandler;
                }

            } catch (e) {
                console.error(e);
                context.alert(e.toString(), "Error").show()

            } finally {
                loader.hide();
            }
        });
    }


    let elem = (<>
        <TouchableOpacity onPress={browse} css="settingButton borderTop">
            <Icon
                invertColor={true}
                type="MaterialCommunityIcons"
                name="folder"
            />
            <Text css="fos:12" invertColor={true}>{state.uri}</Text>
            <ProgressBar procent={state.progress} ifTrue={() => loader.loading} />
            {loader.elem}
        </TouchableOpacity>
    </>
    )

    return { elem }

}