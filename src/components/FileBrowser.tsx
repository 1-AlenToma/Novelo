import * as React from "react";
import { View, Text, TouchableOpacity, ScrollView, Icon, Modal, AlertDialog, TextInput, ActionSheet } from "react-native-short-style";
import FileHandler from "../native/FileHandler";
import { EXT, SelectionType } from "../Types";
import { ReadDirItem } from "react-native-fs";

import {
    checkManagePermission,
    requestManagePermission,
} from 'manage-external-storage';

const FileBrowser = (
    { path, use, ext, selectionType }
        :
        { selectionType: SelectionType, ext?: EXT[], path?: string, use: (uri: (ReadDirItem)) => void }) => {
    const root = context.files.RNF.ExternalStorageDirectoryPath;
    const state = buildState(() =>
    ({
        containerPath: path ?? root,
        containerDirItem: undefined as ReadDirItem | undefined,
        selectedPath: undefined as ReadDirItem | undefined,
        create: false,
        files: [] as ReadDirItem[],
        handler: undefined as FileHandler | undefined,
        newFolderName: "",
        managedFiles: false
    })).ignore("handler", "containerDirItem", "selectedPath").build();


    const back = () => {
        let pathSplit = state.containerPath.trimEnd("/").split("/")
        pathSplit.pop();
        let p = pathSplit.join("/");
        if (p.indexOf(root) !== -1)
            state.containerPath = p;
    }

    const render = async () => {

        if (!state.managedFiles) {
            return;
        }
        let fileHandler = new FileHandler(state.containerPath);
        let files = await fileHandler.RNF.readDir(state.containerPath);
        state.containerDirItem = root == state.containerPath ? undefined : (await fileHandler.RNF.readDir(state.containerPath.split("/").reverse().skip(0).reverse().join("/"))).find(x => x.path == state.containerPath)
        files = files.filter(x => x.isDirectory() || (x.isFile() && ext?.find(e => x.name.toLowerCase().endsWith("." + e))));
        state.files = files;
        state.handler = fileHandler;
    }

    useEffect(() => {
        checkManagePermission().then(x => {
            state.managedFiles = x;
        });
    }, []);



    state.useEffect(render, "containerPath", "managedFiles");

    const deleteItem = () => {
        if (state.selectedPath) {
            let msg = state.selectedPath.isDirectory() ? "Are you sure, you want to remove this folder and its content?" :
                "Are you sure, you want to remove this File?"
            AlertDialog.confirm({ message: msg, title: "Attention" })
                .then(async confirm => {
                    if (confirm && state.handler && state.selectedPath) {
                        await state.handler.RNF.unlink(state.selectedPath.path);
                        state.selectedPath = undefined;
                        render();
                    }
                })
        }
    }

    const createFolder = async () => {
        try {
            if (!state.newFolderName.empty() && state.handler) {
                let p = state.containerPath.path(state.newFolderName);
                if (!await state.handler.RNF.exists(p)) {
                    await state.handler.RNF.mkdir(p);
                    state.newFolderName = "";
                    state.create = false;
                    render();
                } else AlertDialog.toast({ message: "Folder with this name already exist, please choose other Name", title: "Attention" });

            }
        } catch {
            state.newFolderName = "";
            state.create = false;
            AlertDialog.alert({ message: "Creating Folder in this dir is not allowed, please choose a folder", title: "Error" });

        }
    }

    return (
        <View css="flex:1 mat:10 pa:5 invert">
            <ActionSheet size={200} css="wi-90%" isVisible={state.selectedPath != undefined && selectionType === "Folder"} onHide={() => state.selectedPath = undefined}>
                <View css="flex invert">
                    <TouchableOpacity css="listButton pal:5 fld-row" onPress={deleteItem} ifTrue={() => state.selectedPath != undefined && selectionType === "Folder"}>
                        <Icon type="MaterialIcons" css="invertco" name="folder-delete" />
                        <Text css="pal-5 invertco header">Delete</Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
            <View ifTrue={() => state.managedFiles} css="he:50 invert">
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View css="flex:0 he:50 fld:row juc:flex-end ali:center invert">
                        <TouchableOpacity css="fileButton invert" onPress={back} ifTrue={() => state.containerPath != root}>
                            <Icon type="MaterialIcons" name="backspace" />
                            <Text css="invertco">Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity css="fileButton invert" ifTrue={() => selectionType == "Folder"} onPress={() => {
                            if (state.containerPath == root) {
                                AlertDialog.alert({ message: "This Path cant be used, please choose/create a Folder", title: "Attention" });
                                return;
                            }
                            use(state.containerDirItem as any)
                        }}>
                            <Icon type="MaterialIcons" css="invertco" name="select-all" />
                            <Text css="invertco">Use this Folder</Text>
                        </TouchableOpacity>

                        <TouchableOpacity css="fileButton invert" ifTrue={() => selectionType == "Folder"} onPress={() => state.create = true}>
                            <Icon type="MaterialIcons" css="invertco" name="create-new-folder" />
                            <Text css="invertco">New Folder</Text>
                        </TouchableOpacity>
                        <Modal css={"he-200"} addCloser={true} isVisible={state.create} onHide={() => state.create = false}>
                            <View css="mat-10 bac-transparent flex-1">
                                <TextInput
                                    placeholder="Folder Name"
                                    css="invert"
                                    style={{
                                        marginTop: 10,
                                        borderWidth: .5,
                                        borderColor: "gray",
                                        padding: 5
                                    }} placeholderTextColor={"gray"}
                                    onChangeText={(t) => state.newFolderName = t} />
                                <TouchableOpacity css="fileButton he:50 wi:50% mat:10 bac-blue" onPress={createFolder} ifTrue={() => !state.newFolderName.empty()}>
                                    <Text css="invertco">Create</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </View>
            <View css="fl:1 juc:center ali:center invert" ifTrue={() => !state.managedFiles}>
                <TouchableOpacity css="fileButton he:50 bow:0" onPress={async () => {
                    if (!(state.managedFiles = await requestManagePermission())) {
                        AlertDialog.alert({ message: "Please give permission to access your storage, this is importend to be able to handle file operations", title: "Attention" });
                        return;
                    }
                }}>
                    <Text css="co:blue fow:bold">Give Permission</Text>
                </TouchableOpacity>
            </View>
            <View css="flex:1 invert" ifTrue={() => state.managedFiles}>
                <Text css="fos:10 co:gray" >path:{state.containerPath}</Text>
                <ScrollView>
                    {
                        state.files.map((x, i) => (
                            <TouchableOpacity key={i + x.path} onLongPress={() => {
                                state.selectedPath = x;

                            }} onPress={() => {


                                if (state.selectedPath?.path === x.path) {
                                    state.selectedPath = undefined;
                                    return
                                }
                                state.selectedPath = undefined;
                                if (x.isDirectory()) {
                                    state.containerPath = x.path;
                                }
                                else {
                                    if (selectionType == "File") {
                                        use(x)
                                        state.selectedPath = x;
                                    }

                                }

                            }} css={`settingButton invert maw:95% ${x.path === state.selectedPath?.path ? "selectedRow" : ""}`}>
                                <Icon
                                    css="invertco"
                                    type="MaterialCommunityIcons"
                                    name={x.isDirectory() ? "folder" : (x.name.toLowerCase().endsWith(".epub") || x.name.toLowerCase().endsWith(".zip") ? "zip-box" : "card-text-outline")}
                                />
                                <Text css="fos:12 wi:90% invertco">{x.name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </View>
        </View>
    );
}


export default FileBrowser;