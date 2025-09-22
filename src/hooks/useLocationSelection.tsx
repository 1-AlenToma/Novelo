import * as React from "react";
import {
    Modal, TouchableOpacity, Icon,
    Text,
    View,
    ProgressBar,
    useLoader,
    FileBrowser,
    AlertDialog
} from "../components";
import { ImageCache } from "../native";
import FileHandler from "../native/FileHandler";
import { FilesPath } from "../Types";




export default () => {
    context.hook("appSettings.filesDataLocation", "appSettings.filesDataLocation");
    const state = buildState(() =>
    ({
        uri: context.appSettings.filesDataLocation ?? context.files.dir,
        progress: 0
    })).build();
    const loader = useLoader()

    const browse = async () => {
        let uri = await context.browser.pickFolder("Use new location for Novelo to save its data.")
        if (!uri || uri.path === context.appSettings.filesDataLocation) {
            return;
        }

        AlertDialog.confirm({ message: "We will begin moving the data to the new location" }).then(async (confirm) => {
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

                    await context.db.commitTransaction();
                    state.uri = context.appSettings.filesDataLocation = uri.path;
                    context.imageCache = imageHandler;
                    context.files = fileHandler;
                    await context.appSettings.saveChanges();

                }

            } catch (e) {
                console.error(e);
                AlertDialog.alert({ message: e.toString(), title: "Error" });

            } finally {
                loader.hide();
            }
        });
    }


    let elem = (<>
        <TouchableOpacity onPress={browse} css="settingButton borderTop">
            <Icon
                type="MaterialCommunityIcons"
                name="folder"
            />
            <Text css="fos:12 invertco">{state.uri}</Text>
            <ProgressBar value={state.progress / 100} ifTrue={() => loader.loading} />
            {loader.elem}
        </TouchableOpacity>
    </>
    )

    return { elem }

}