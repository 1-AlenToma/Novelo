import { Alert } from 'react-native';
import { UpdateAPK } from 'rn-update-apk';
import { TouchableOpacity, Text, Icon, ProgressBar, View, AlertDialog } from '../components';
import * as React from "react";
import * as Application from 'expo-application';



export default () => {

    const state = buildState({
        progress: 0,
        downloading: false,
        updater: new UpdateAPK({
            //iosAppId: '123456', // iOS is app store only, but we can point the user there
            apkVersionUrl: 'https://raw.githubusercontent.com/1-AlenToma/Novelo/main/AppVersion_2.json',
            fileProviderAuthority: `${Application.applicationId}.provider`,
            needUpdateApp: (needUpdate, whatsNew) => {
                AlertDialog.confirm({
                    message: `New version released, do you want to update?\n ${whatsNew}`,
                    title: "Update Available"
                }).then((c) => {
                    if (c)
                        needUpdate(true);
                });
            },
            forceUpdateApp: () => {
                console.log("Force update will start")
            },
            notNeedUpdateApp: () => {
                AlertDialog.alert({
                    message: "App is up to date",
                    title: "App Update"
                });
                console.log("App is up to date")
            },
            downloadApkStart: () => { state.downloading = true },
            downloadApkProgress: (progress) => { state.progress = progress; },
            downloadApkEnd: () => { state.downloading = false },
            onError: (e) => {
                //    console.error(e)
            }
        })
    }).ignore("updater").build();

    return (
        <TouchableOpacity
            css="settingButton invert"
            onPress={() => state.updater.checkUpdate()}>
            <Icon
                type="MaterialCommunityIcons"
                name="update"
                css="invertco"
            />
            <ProgressBar css="_abc wi-100% to-1 he-100%" ifTrue={() => state.downloading} value={state.progress / 100} />
            <Text>
                Check for app update
            </Text>

        </TouchableOpacity>

    )
}
