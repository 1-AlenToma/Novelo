import * as React from "react";
import { pickDirectory } from "react-native-document-picker";
import { Modal, TouchableOpacity, Icon, Text, View, Form } from "../components";
import * as MediaLibrary from "expo-media-library";
import { FileHandler } from "../native";
import { FilesPath } from "../Types";

export default () => {
    context.hook("appSettings.filesDataLocation");
    const state = buildState({
        uri: context.appSettings.filesDataLocation,
        loading: false,
        progress: 0,
        visible: false
    }).build();

    const browse = () => {
        context.alert("Please Choose a location somewhere in document or download.", "Attention").confirm(async (confirmed) => {
            if (confirmed) {
                let { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== "granted") {
                    context.alert("You have to allow permission to the documents directory").show();
                    return;
                }
                let response = await pickDirectory();
                if (response && response.uri) {
                    context.alert("We will begin moving the data to the new location").toast();
                    state.loading = true;
                    let fileHandler = new FileHandler(response.uri.path(FilesPath.File));
                    let files = await context.files.allFilesInfos();
                    state.progress = 0.1;
                    for (let i = 0; i < files.length; i++) {
                        let content = await context.files.read(files[i].path);
                        await fileHandler.write(files[i].name, content);
                        state.progress = files.length.procent(i);
                    }

                }

            }
        });
    }

    let elem = (<>
        <TouchableOpacity css="settingButton" text="Data location path">
            <TouchableOpacity onPress={() => state.visible = true}>
                <Text invertColor={true}>{state.uri}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
        <Modal height={200} visible={state.visible}>

        </Modal>
    </>
    )

}