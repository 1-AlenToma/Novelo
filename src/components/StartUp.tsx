import { View, Text, Button, useLoader, ProgressBar } from "react-native-short-style";
import {
    checkManagePermission,
    requestManagePermission,
} from 'manage-external-storage';
import RNFS from 'react-native-fs';
import { TTSConfig } from "Types";
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
            state.hasPer = await checkManagePermission();
            state.ttsLoaded = await exist(context.tts.male) && await exist(context.tts.female);
            if (!state.mounted) {
                state.mounted = true;
                loader.hide();
            }
        })
    }

    useEffect(() => {
        checkPermissions();
    }, [])

    const exist = async (configs: TTSConfig[]) => {
        for (let config of configs) {
            if (!await RNFS.exists(context.tts.base.path(config.path))) {
                console.warn("Modol", context.tts.base.path(config.path), "not found")
                return false;
            }
            if (!await RNFS.exists(config.config.dataDirPath) || !await RNFS.exists(config.config.modelPath) || !await RNFS.exists(config.config.tokensPath)) {
                console.warn("Modol", config.config.dataDirPath, config.config.modelPath, config.config.tokensPath, "not found")
                return false;

            }
        }
        return true;
    }
    const downloadModel = async (config: TTSConfig, toPath: string) => {
        let sub = subscribe(({ progress }) => {
            state.progress = progress * 100
        });
        const name = config.name.replace(/\(|\)/g, "");
        console.log("tpPath", toPath)
        toPath = toPath.split("/").filter(x => x.length > 0).reverse().skip(0).reverse().join("/");
        const zipFile = downloadPath.path(name + ".zip");
        if (await RNFS.exists(zipFile))
            await RNFS.unlink(zipFile);
        try {

            if (!(await RNFS.exists(zipFile))) {
                state.modolName = `Downloading ${config.name}`;

                await RNFS.downloadFile({
                    fromUrl: config.link,
                    toFile: zipFile,
                    progress: value => {
                        state.progress = value.contentLength.downloadPercent(value.bytesWritten);
                    }
                }).promise;
            }


            // ✅ ENSURE TARGET DIRECTORY EXISTS
            if (!(await RNFS.exists(toPath))) {
                await RNFS.mkdir(toPath);
            }

            state.modolName = `Extracting ${config.name}`;
            console.log(`Extracting ${zipFile} to ${toPath}`)

            // ✅ FORCE UNZIP
            const extractedPath = await unzip(zipFile, toPath);

            console.log("Unzipped to:", extractedPath);

        } catch (e) {
            console.error("Unzip error:", e);
        } finally {
            sub.remove();
            if (await RNFS.exists(zipFile))
                await RNFS.unlink(zipFile);
        }
    };


    async function copyAssetsToFS() {
        try {
            loader.show();
            if (!await exist(context.tts.male)) {
                for (let config of context.tts.male) {
                    state.modolName = `Parsing model for ${config.name}`;
                    // Recursively copy folder
                    await downloadModel(config, context.tts.base.path(config.path));
                }
            }

            if (!await exist(context.tts.female)) {
                for (let config of context.tts.female) {
                    state.modolName = `Parsing model for ${config.name}`;
                    // Recursively copy folder
                    await downloadModel(config, context.tts.base.path(config.path));
                }
            }

            await checkPermissions();
        } finally {

            state.progress = 100;
            loader.hide()
        }
    }




    async function sayHello() {
        try {
            const text = 'Hello world – spoken entirely offline!';
            const text2 = 'Hello world – spoken entirely online!';
            await context.tts.initialize("Kristin(Low)");
            await context.tts.speak({ text });
            await context.tts.speak({ text: text2 });
        } catch (e) {
            console.error(e);
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
                state.hasPer = await requestManagePermission()
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