import { Alert } from 'react-native';
import { UpdateAPK } from 'rn-update-apk';
import { TouchableOpacity, Text, Icon, ProgressBar, View } from '../components';
import * as React from "react";
import * as Application from 'expo-application';



export default () => {

    const state = buildState({
        progress: 0,
        downloading: false,
        updater: new UpdateAPK({
            //iosAppId: '123456', // iOS is app store only, but we can point the user there
            apkVersionUrl: 'https://raw.githubusercontent.com/1-AlenToma/Novelo/main/AppVersion.json',
            fileProviderAuthority: `${Application.applicationId}.provider`,
            needUpdateApp: (needUpdate) => {
                context.alert('New version released, do you want to update?', "Update Available").confirm((c) => {
                    if (c)
                        needUpdate(true);
                });
            },
            forceUpdateApp: () => {
                console.log("Force update will start")
            },
            notNeedUpdateApp: () => {
                context.alert("App is up to date", "App Update").show()
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
            css="settingButton"
            onPress={() => state.updater.checkUpdate()}>
            <Icon
                invertColor={true}
                type="MaterialCommunityIcons"
                name="update"
            />
            <ProgressBar ifTrue={() => state.downloading} procent={state.progress} />
            <Text invertColor={true}>
                Check for app update
            </Text>
            
        </TouchableOpacity>

    )
}
