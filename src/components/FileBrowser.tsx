import * as React from "react";
import { Modal, TouchableOpacity, Icon, Text, View } from ".";
import { FileHandler, ImageCache } from "../native";
import { FilesPath, EXT, SelectionType } from "../Types";
import { ReadDirItem } from "react-native-fs";
import { ScrollView, TextInput } from "react-native";
import {
    checkManagePermission,
    requestManagePermission,
} from 'manage-external-storage';

const FileBrowser = (
    { path, use, ext, selectionType }
        :
        { selectionType: SelectionType, ext?: EXT[], path?: string, use: (uri: (ReadDirItem)) => void }) => {
    const root = context.files.RNF.ExternalStorageDirectoryPath;
    const state = buildState({
        containerPath: path ?? root,
        containerDirItem: undefined as ReadDirItem | undefined,
        selectedPath: undefined as ReadDirItem | undefined,
        create: false,
        files: [] as ReadDirItem[],
        handler: undefined as FileHandler | undefined,
        newFolderName: "",
        managedFiles: false
    }).ignore("handler", "files", "containerDirItem", "selectedPath").build();


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
        files = files.filter(x => x.isDirectory() || (x.isFile() && selectionType == "File" && ext?.find(e => x.name.toLowerCase().endsWith("." + e))));
        state.files = files;
        state.handler = fileHandler;
        // console.warn(state.files, files, state.containerPath);
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
            context.alert(msg, "Attention").confirm(async confirm => {
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
                } else context.alert("Folder with this name already exist, please choose other Name", "Attention").toast();

            }
        } catch {
            state.newFolderName = "";
            state.create = false;
            context.alert("Creating Folder in this dir is not allowed, please choose a folder", "Error").show();

        }
    }

    return (
        <View css="flex:1 mat:10 pa:5">
            <View ifTrue={() => state.managedFiles} css="he:50">
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View css="flex:0 he:50 fld:row juc:flex-end ali:center">
                        <TouchableOpacity css="fileButton" onPress={back} ifTrue={() => state.containerPath != root}>
                            <Icon type="MaterialIcons" invertColor={true} name="backspace" />
                            <Text invertColor={true}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity css="fileButton" ifTrue={() => selectionType == "Folder"} onPress={() => {
                            if (state.containerPath == root) {
                                context.alert("This Path cant be used, please choose/create a Folder", "Attention").show();
                                return;
                            }
                            use(state.containerDirItem as any)
                        }}>
                            <Icon type="MaterialIcons" invertColor={true} name="select-all" />
                            <Text invertColor={true}>Use this Folder</Text>
                        </TouchableOpacity>
                        <TouchableOpacity css="fileButton" onPress={deleteItem} ifTrue={() => state.selectedPath && selectionType == "Folder"}>
                            <Icon type="MaterialIcons" invertColor={true} name="folder-delete" />
                            <Text invertColor={true}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity css="fileButton" ifTrue={() => selectionType == "Folder"} onPress={() => state.create = true}>
                            <Icon type="MaterialIcons" invertColor={true} name="create-new-folder" />
                            <Text invertColor={true}>New Folder</Text>
                        </TouchableOpacity>
                        <Modal height={200} visible={state.create} onHide={() => state.create = false}>
                            <TextInput placeholder="Folder Name" style={{
                                marginTop: 10,
                                borderWidth: .5,
                                borderColor: "gray",
                                padding: 5,
                                color: context.theme.invertSettings().color
                            }} placeholderTextColor={"gray"} onChangeText={(t) => state.newFolderName = t} />
                            <TouchableOpacity css="fileButton he:50 wi:50% mat:10" onPress={createFolder} ifTrue={() => !state.newFolderName.empty()}>
                                <Text invertColor={true}>Create</Text>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                </ScrollView>
            </View>
            <View css="fl:1 juc:center ali:center" ifTrue={() => !state.managedFiles}>
                <TouchableOpacity css="fileButton he:50 bow:0" onPress={async () => {
                    if (!(state.managedFiles = await requestManagePermission())) {
                        context.alert("Please give permission to access your storage, this is importend to be able to handle file operations", "Attention").show();
                        return;
                    }
                }}>
                    <Text css="co:blue fow:bold" invertColor={true}>Give Permission</Text>
                </TouchableOpacity>
            </View>
            <View css="flex:1" ifTrue={() => state.managedFiles}>
                <Text css="fos:10 co:gray" invertColor={true}>path:{state.containerPath}</Text>
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

                            }} css={`settingButton maw:95% ${x.path === state.selectedPath?.path ? "selectedRow" : ""}`}>
                                <Icon
                                    invertColor={true}
                                    type="MaterialCommunityIcons"
                                    name={x.isDirectory() ? "folder" : (x.name.toLowerCase().endsWith(".epub") || x.name.toLowerCase().endsWith(".zip") ? "zip-box" : "card-text-outline")}
                                />
                                <Text css="fos:12 wi:90%" invertColor={true}>{x.name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </View>
        </View>
    );
}


export default FileBrowser;