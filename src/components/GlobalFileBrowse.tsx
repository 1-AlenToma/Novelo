import FileBrowser from "./FileBrowser";
import Modal from "./Modal";
import * as React from "react";
import {View, AnimatedView, Text, TouchableOpacity, ScrollView} from "./ReactNativeComponents";

export default () => {
    context.hook("browser.data")



    return (
        <Modal title={`Select ${context.browser.data?.props.ext?.firstOrDefault() ?? "Folder"}`} onHide={() => {
            context.browser.data?.onCancel?.()
            context.browser.data = undefined
        }
        } height="80" visible={context.browser.data != undefined}>
            <Text ifTrue={()=> context.browser.data?.desc} css="fos:12 co:red" invertColor={true}>{context.browser.data?.desc}</Text>
            <FileBrowser use={async (file) => {
                await context.browser.data?.func(file);
                context.browser.data = undefined;
            }} ext={["epub"]} selectionType="File" {...context.browser.data?.props} />
        </Modal>
    )

}