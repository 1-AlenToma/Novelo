import { View, Text, Button, useLoader, ProgressBar } from "react-native-short-style";
import RNFS from 'react-native-fs-turbo';
import { TTSConfig } from "../Types";
import { unzip, subscribe } from 'react-native-zip-archive';

const downloadPath = RNFS.CachesDirectoryPath;

export const StartUp = ({ children }: { children: any }) => {

    const loader = useLoader(true);
    const state = buildState({
        hasPer: false,
        ttsLoaded: false,
        progress: 0,
        modolName: "",
        mounted: false
    }).build();

    const checkPermissions = async () => {
        await state.batch(async () => {
            state.hasPer = await methods.isStoragePermissionGranted();
            state.ttsLoaded = await exist()
            if (!state.mounted) {
                state.mounted = true;
                loader.hide();
            }
        })
    }

    useEffect(() => {
        checkPermissions();
    }, [])

    const exist = async () => {

        if (!await RNFS.exists(context.tts.config.modelPath)
            || !await RNFS.exists(context.tts.config.voicesPath)
            || !await RNFS.exists(context.tts.config.tokenizerPath)) {
            console.warn("TTs modols not found")
            return false;
        }

        return true;
    }
    const downloadModel = async () => {
        const sub = subscribe(({ progress }) => {
            state.progress = progress * 100;
        });

        const zipFile = downloadPath.path(context.tts.modoleName);
        if (await RNFS.exists(zipFile)) {
            await RNFS.unlink(zipFile);
        }

        try {
            state.progress = 0;
            state.modolName = `Downloading ${context.tts.modoleName}`;

            const res = await RNFS.downloadFile({
                fromUrl: context.tts.link,
                toFile: zipFile,
                progress: (value) => {
                    if (value.contentLength > 0) {
                        state.progress = value.contentLength.downloadPercent(value.bytesWritten);
                    }
                },
            }).promise;

            if (res.statusCode !== 200) {
                throw new Error(`Download failed with HTTP ${res.statusCode}`);
            }

            if (!(await RNFS.exists(context.tts.fullPath))) {
                await RNFS.mkdir(context.tts.fullPath);
            }

            state.progress = 0; // ✅ Reset bar for extraction phase
            state.modolName = `Extracting ${context.tts.modoleName}`;
            const extractedPath = await unzip(zipFile, context.tts.fullPath);

            // ✅ Verify exact extracted filenames in Metro logs
            const files = await RNFS.readDir(extractedPath);
            console.log("Extracted files:", files.map((f) => f.name));
        } catch (e) {
            console.error("TTS Model setup error:", e);
        } finally {
            sub?.remove();
            if (await RNFS.exists(zipFile)) {
                await RNFS.unlink(zipFile);
            }
        }
    };

    async function copyAssetsToFS() {
        try {
            loader.show();
            if (!await exist()) {
                await downloadModel();
            }

            await checkPermissions();
        } finally {

            state.progress = 100;
            loader.hide()
        }
    }




    if (state.ttsLoaded && state.hasPer)
        return children;

    if (!state.mounted)
        return loader.elem;

    return (
        <View css="fl-1 pa-10">
            <Text css="desc fos-15">File permission.{"\n"}
                <Text css="note co-red fos-12 fow-bold">This is very important as Novelo needs this to writes/read novel information</Text>
            </Text>
            <Button disabled={state.hasPer} onPress={async () => {
                state.hasPer = await methods.handleStoragePermission()
            }} text="Give permission" />

            <Text css="desc fos-15">Download the tts Models.{"\n"}
                <Text css="note co-red fos-12 fow-bold">This is very important as Novelas do not use the mobile inbuilt text to speech function, and use its own more fluent tts</Text>
            </Text>
            <Button disabled={loader.loading || state.ttsLoaded} text="Load tts Models" onPress={copyAssetsToFS} />
            <ProgressBar ifTrue={state.progress > 0 && loader.loading} css="mah-20" value={state.progress / 100} >
                <Text css="co-#fff fow-bold">{`${state.modolName}`}</Text>
            </ProgressBar>

        </View>
    )
}