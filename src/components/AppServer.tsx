import * as React from "react";
import { Text, Button, FormItem, TextInput, Loader, Icon, Modal, TouchableOpacity, View, AlertDialog } from "react-native-short-style";
import TextInputView from "./TextInputView";
import { Linking } from "react-native";

export const AppServer = () => {

    const state = buildState({
        data: { ...context.appLocalSettings.data },
        isLoading: false,
        visible: false,
        connected: undefined as boolean | undefined
    }).ignore("data").build();

    useEffect(() => {
        state.data = { ...context.appLocalSettings.data }
        state.connected = undefined;
    }, [state.visible])

    const save = async () => {
        try {
            state.isLoading = true;
            if (!await context.appLocalSettings.test(state.data.serverIp)) {
                AlertDialog.alert("Could not connect to the server ip, make sure to forword the ip if its an external ip.");
                state.connected = false;
                return;
            }
            await context.appLocalSettings.set({ ...state.data });
            state.connected = true;
        } catch (e) {
            console.error(e);
        } finally {
            state.isLoading = false
        }
    }

    const clear = async () => {
        state.data.serverIp = "";
        await context.appLocalSettings.set({ ...state.data });
        state.visible = false;
    }


    return (<>
        <TouchableOpacity
            css="invert settingButton"
            onPress={() => state.visible = true}>
            <Icon
                type="AntDesign"
                name="cloud-server"
                css="invertco"
            />
            <Text>
                App Server
                <Text css="desc co-red">{"\n"}Connect to Novelo Server</Text>
            </Text>
        </TouchableOpacity>
        <Modal css="he-50%" addCloser={true} isVisible={state.visible} onHide={() => state.visible = false}>
            <Loader loading={state.isLoading} text="checking the server">
                <View css="invert fl-1 ali-flex-end">

                    <FormItem css="bow-0 fl-1 mih-87% wi-100% mab-5" title="Server Ip">
                        <Text css="desc">You will need to restart the app after changing this</Text>
                        <TextInputView placeholder="Server Ip eg http://192.168.1.239:5002"
                            style={{ paddingLeft: 5, color: state.connected ? "green" : state.connected == undefined ? "gray" : "red" }}
                            defaultValue={state.data.serverIp} onChangeText={x => state.data.serverIp = x} />
                        <Text onPress={() => Linking.openURL("https://github.com/1-AlenToma/Novelo.Service")} css="link">Read how to in https://github.com/1-AlenToma/Novelo.Service</Text>
                    </FormItem>
                    <View css="fld-row">
                        <Button icon={<Icon type="AntDesign" name="clear" />} onPress={clear} text="Clear" css="par-5" />
                        <Button icon={<Icon type="Entypo" name="save" />} onPress={save} text="Save" css="mal-5 par-5" />

                    </View>
                </View>
            </Loader>
        </Modal>
    </>
    )
}