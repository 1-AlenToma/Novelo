import FileBrowser from "./FileBrowser";
import * as React from "react";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView, Modal } from "./ReactNativeComponents";

export default () => {
    context.hook("browser.data")
    const ext = `(.${(context.browser.data?.props?.ext?.firstOrDefault() ?? "Folder")})`;
    return (
        <Modal addCloser={true} onHide={async () => {
            if (context.browser.data?.onCancel)
                await context.browser.data?.onCancel?.()
            context.browser.data = undefined
        }
        } css="he-80%" isVisible={context.browser.data != undefined}>
          <View css="bac-transparent mat-10 flex-1">
            <Text ifTrue={context.browser.data?.desc != undefined} css="fos:12 co:red invertco">{context.browser.data?.desc} {ext}</Text>
            <FileBrowser use={async (file) => {
                await context.browser.data?.func(file);
                context.browser.data = undefined;
            }} ext={["epub"]} selectionType="File" {...context.browser.data?.props} />
          </View>
        </Modal>
    )

}