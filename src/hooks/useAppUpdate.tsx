import { Alert } from 'react-native';
import {UpdateAPK } from 'rn-update-apk';

export default () => {
    const updater = new UpdateAPK({
        //iosAppId: '123456', // iOS is app store only, but we can point the user there
        apkVersionUrl: 'https://github.com/your-github-name/version.json',
        fielProviderAuthority: "com.example.fileprovider",
        needUpdateApp: (needUpdate) => {
            Alert.alert(
                'Update Available',
                'New version released, do you want to update?',
                [
                    { text: 'Cancel', onPress: () => { } },
                    { text: 'Update', onPress: () => needUpdate(true) }
                ]
            );
        },
        forceUpdateApp: () => {
            console.log("Force update will start")
        },
        notNeedUpdateApp: () => {
            console.log("App is up to date")
        },
        downloadApkStart: () => { console.log("Start") },
        downloadApkProgress: (progress) => { console.log(`Downloading ${progress}%...`) },
        downloadApkEnd: () => { console.log("End") },
        onError: () => { console.log("downloadApkError") }
    });
    updater.checkUpdate();
}
