import dbContext from "./db/dbContext";
import AppSettings from "./db/AppSettings";
import DownloadManager from "./native/DownloadManager";
import Html from "./native/Html";
import Notification from "./native/Notification";
import {
    Value,
    ChapterInfo,
    LightInfo,
    DetailInfo,
    ParserDetail,
    SearchDetail,
    Parser,
} from "./native/ParserItems";

import { Dimensions, Keyboard, LogBox, Platform } from "react-native";
import StateBuilder, { newId } from "react-smart-state";
import { GlobalType, FilesPath, WebViewProps, IGlobalState, TTSConfig, TTSNames } from "./Types";
import * as ScreenOrientation from "expo-screen-orientation";
import ParserWrapper from "./parsers/ParserWrapper";
import { version } from "./package.json"
import HttpHandler from "./native/HttpHandler";
import FileHandler from "./native/FileHandler";
import FilesZipper from "./native/Zip";
import Player from "./native/Player";
import ImageCache from "./native/ImageCache";
import BGService from "./native/BackgroundService";
import { ConsoleInterceptor } from "./native/ConsoleInterceptor";
import RNFS from 'react-native-fs';
import TTSManager from 'react_native_sherpa_onnx_offline_tts';
import { AppState, AppStateStatus } from "react-native"


LogBox.ignoreLogs([
    "fontFamily",
    "require cycles",
    "Require cycle",
    "new NativeEventEmitter",
    "Internal React error",
    "xmldom warning"
]);

ConsoleInterceptor.enable();



var globalDb = new dbContext();
const globalHttp = new HttpHandler();

let currentParser = ParserWrapper.getAllParsers("ReadNovelFull") as ParserWrapper;
const downloadManager = new DownloadManager();
const cache = new FileHandler(FilesPath.Cache, "Cache");
const zip = new FilesZipper();
const notification = new Notification();
const privateData = new FileHandler(FilesPath.Private, "File");
const debugMode = __DEV__;
const ttsLocalPathBase = RNFS.DocumentDirectoryPath;

const generateTTsConfig = (name: TTSNames, fileName: string, sampleRate: number = 22050): TTSConfig => {
    return {
        link: `https://github.com/1-AlenToma/Novelo/releases/download/tts-modols/${fileName}.zip`,
        name: name,
        path: `tts/${fileName}`,
        sampleRate,
        config: {
            modelPath: `${ttsLocalPathBase}/tts/${fileName}/${fileName.replace(/(vits-piper-)|(-fp16)/gim, "").trim()}.onnx`,
            tokensPath: `${ttsLocalPathBase}/tts/${fileName}/tokens.txt`,
            dataDirPath: `${ttsLocalPathBase}/tts/${fileName}/espeak-ng-data`,
        }
    }
}


const data: IGlobalState = StateBuilder<GlobalType>(
    {
        appState: {
            state: AppState.currentState,
            inBackground: false
        },
        tts: {
            initializing: false,
            loaded: false,
            lastChosenConfig: undefined,
            nameLists: undefined,
            stop: async () => {
                return await TTSManager.stop();
            },
            deinitialize: async () => {
                data.tts.loaded = false;
                data.tts.lastChosenConfig = undefined;
                return TTSManager.deinitialize();
            },
            speak: async (item) => {
                try {
                    if (!data.tts.loaded)
                        await data.tts.initialize(data.tts.lastChosenConfig ?? data.appSettings.ttsModol);
                    return await TTSManager.generateAndPlay({ ...item, speed: data.appSettings.rate });
                } catch (e) {
                    console.error(e)
                }
            },
            initialize: async (config) => {
                console.log("initializing tts")
                try {

                    data.tts.initializing = true;
                    if (data.tts.loaded) {
                        if (data.tts.lastChosenConfig == config)
                            return;// already loaded
                        await TTSManager.deinitialize();
                    }

                    data.tts.loaded = true;
                    data.tts.lastChosenConfig = config;
                    let ttsConfig = [...data.tts.female, ...data.tts.male].find(x => x.name == config) ?? data.tts.male[1];
                    //console.log(ttsConfig);
                    return await TTSManager.initialize(JSON.stringify(ttsConfig.config), ttsConfig.sampleRate, false, 1);
                } catch (e) {
                    console.error(e)
                } finally {
                    data.tts.initializing = false;
                }
            },
            base: ttsLocalPathBase,
            nameList: () => {
                if (data.tts.nameLists)
                    return data.tts.nameLists;
                return (data.tts.nameLists = [...data.tts.male.map(x => x.name), ...data.tts.female.map(x => x.name)])
            },
            female: [
                generateTTsConfig("Kristin(Low)", "vits-piper-en_US-kristin-medium-fp16"),
                generateTTsConfig("Kristin(Medium)", "vits-piper-en_US-kristin-medium")
            ],
            male: [
                generateTTsConfig("Ryan(Low)", "vits-piper-en_US-ryan-low", 16000),
                generateTTsConfig("Ryan(Medium)", "vits-piper-en_US-ryan-medium")
            ]
        },
        bgService: BGService,
        appLocalSettings: {
            data: {} as any,
            get: async () => {
                return JSON.parse((await privateData.read("AppLocalSettings")) ?? "{}")
            },
            set: async (item) => {
                data.appLocalSettings.data = item;
                await privateData.write("AppLocalSettings", JSON.stringify(item))
            },
            test: async (ip: string) => {
                try {
                    ip = ip ?? "";
                    console.log("testing server", ip.join("ping"))
                    const rep = await methods.fetchWithTimeout(ip.join("ping"), {}, 3000);
                    if (!rep.ok)
                        return false;
                    let txt = await rep.text();
                    return txt == "true";
                } catch (e) {
                    console.error(e);
                    return false;
                }

            }
        },
        dbBatch: async (fn) => {
            await context.batch(async () => {
                context.db.disableHooks().disableWatchers();
                await fn();
                await context.db.enableHooks();
                await context.db.enableWatchers();
            })
        },
        versionName: version,
        version: parseInt(version.replace(/\./g, "")),
        notification,
        zip,
        browser: {
            data: undefined,
            pickFile: (ext, desc) => {
                return new Promise<any | undefined>((success) => {
                    data.browser.data = { desc, func: (f: any) => success(f), onCancel: success, props: { selectionType: "File", ext } }
                })
            },
            pickFolder: (desc, ext) => {
                return new Promise<any | undefined>((success) => {
                    data.browser.data = { func: (f: any) => success(f), onCancel: success, desc, props: { selectionType: "Folder", ext } }
                });
            },
        },
        lineHeight: 2.5,
        selectedFoldItem: "",
        panEnabled: true,
        selection: {
            downloadSelectedItem: undefined,
            favoritItem: undefined,
            sliderValue: undefined,
        },
        alertMessage: {
            msg: undefined,
            title: "Action",
            confirm: (answer: boolean) => { }
        },
        novelFavoritInfo: {},
        player: {} as Player,
        http: () => globalHttp,
        downloadManager: () => downloadManager,
        KeyboardState: false,
        isFullScreen: false,
        appSettings: new AppSettings(),
        cache: cache,
        files: new FileHandler(FilesPath.File, "File", true),
        imageCache: new ImageCache(),
        nav: {
            option: undefined,
            navigate: (page, item) => {
                data.nav.option?.nav(page).add(item).push();
            }
        },
        orientation: (value: "Default" | "LANDSCAPE") => {
            ScreenOrientation.lockAsync(
                value === "Default"
                    ? ScreenOrientation.OrientationLock.DEFAULT
                    : ScreenOrientation.OrientationLock.LANDSCAPE
            );
        },
        parser: {
            default: "ReadNovelFull",
            parserCodes: new Map<string, any>(),
            parseCode: (code: string) => {
                if (data.parser.parserCodes.has(code))
                    return data.parser.parserCodes.get(code);
                const parserItem = {
                    Value, ChapterInfo, LightInfo, DetailInfo, ParserDetail, SearchDetail, Parser, Html, HttpHandler
                }
                if (code && code.length > 0) {
                    let className = (code.match(/(.*)\.(prototype.detail)/gim)?.firstOrDefault() ?? "") as string;
                    className = className.safeSplit(".", 0).trim()
                    let runnalbe: any = eval(`(function(require){ ${code} \n return ${className}})`);
                    data.parser.parserCodes.set(code, runnalbe?.(() => parserItem))
                    return data.parser.parserCodes.get(code);
                }
                return undefined as any
            },
            clone: (name: string) => {
                let all = ParserWrapper.getAllParsers() as ParserWrapper[];
                let parsers = !debugMode ? ((context.appSettings.parsers && context.appSettings.parsers.length > 0 ? context.appSettings.parsers.map(x => {
                    let Item = data.parser.parseCode(x.content);
                    if (Item) return new ParserWrapper(new Item());
                    return undefined;
                }) : all).filter(x => x != undefined)) : all;
                let parser = parsers.find(x => x.name == name);
                if (!parser)
                    parser = all.find(x => x.name == name);
                return parser as ParserWrapper;

            },
            current: currentParser,
            find: (name: string) => data.parser.all.find(x => x.name == name) as ParserWrapper,
            set: async (p) => {
                p = data.parser.find(p.name);
                p.settings = await p.load("RenewMemo");
                data.parser.current = p;
                if (data.appSettings.selectedParser != p.name) {
                    data.appSettings.selectedParser = p.name;
                    await data.appSettings.saveChanges();
                }

                // data.updater = newId();
                //alert(p.name)
            },
            all: []
        },
        updater: newId(),
        selectedThemeIndex: 0,
        db: globalDb,
        size: {
            window: Dimensions.get("window"),
            screen: Dimensions.get("screen")
        },
        AppStart: async () => {
            try {
                let appSettingWatcher: any = {};
                //  await setupTTS();
                //  await sayHello();
                await context.batch(async () => {
                    data.appLocalSettings.data = JSON.parse((await privateData.read("AppLocalSettings")) ?? "{}");
                    if (data.appLocalSettings.data.serverIp && !data.appLocalSettings.data.serverIp.empty() && await data.appLocalSettings.test(data.appLocalSettings.data.serverIp))
                        data.db = globalDb = new dbContext(data.appLocalSettings.data);
                    else if (data.appLocalSettings.data.serverIp && !data.appLocalSettings.data.serverIp.empty()) alert(`Could not connect to Novelo server, Check your internet settings or make sure that Novelo server is reachable. Will be using local db instead`);

                    // await globalDb.dropTables();
                    let currentParserString: string = "";
                    const loadParsers = async () => {
                        await context.batch(async () => {
                            const defaultParser = ParserWrapper.getAllParsers(data.parser.default) as ParserWrapper;
                            if (debugMode) {
                                data.parser.all = ParserWrapper.getAllParsers() as ParserWrapper[];
                                return;
                            }

                            let settings = data.appSettings;
                            if (!settings.parsers)
                                settings.parsers = [];
                            if (currentParserString == JSON.stringify(settings.parsers))
                                return;
                            currentParserString = JSON.stringify(settings.parsers);
                            let parserObjects = settings.parsers.map(x => data.parser.parseCode(x.content)).filter(x => x != undefined).map((x: any) => new x());
                            let parsers: ParserWrapper[] = [];
                            if (!parserObjects.find(x => x.name == data.parser.default))
                                parsers.push(defaultParser);
                            parsers.push(...parserObjects.map(x => new ParserWrapper(x)));
                            parsers = parsers.sort((a, b) => {
                                if (a.name == data.parser.default) { return -1; }
                                return 1;
                            })
                            data.parser.all = parsers;
                            if (data.appSettings.currentNovel && !data.appSettings.currentNovel.isEpub && !parsers.find(x => x.name == data.appSettings.currentNovel?.parserName)) {
                                data.appSettings.currentNovel = {} as any;
                                await data.appSettings.saveChanges();
                            }
                            if (!parsers.find(x => x.name == data.parser.current.name))
                                await data.parser.set(parsers[0]);

                            if (data.player && !data.player.isEpup && data.player.book && data.player.book.parserName && !parsers.find(x => x.name == data.player.book.parserName)) {
                                data.player.showPlayer = data.player.hooked = false;
                                data.player.playing(false);
                                await context.tts.stop();

                            }
                        });
                    }


                    await globalDb.setUpDataBase();
                    await globalDb.migrateNewChanges();
                    data.appSettings = await globalDb.AppSettings.query.findOrSave(data.appSettings);
                    if (data.appSettings.filesDataLocation && !data.appSettings.filesDataLocation.empty()) {
                        data.files = new FileHandler(data.appSettings.filesDataLocation.path(FilesPath.File), undefined, true);
                        data.imageCache = new ImageCache(data.appSettings.filesDataLocation.path(FilesPath.Images))
                    }
                    await loadParsers();
                    if (data.parser.find(data.appSettings.selectedParser)) {
                        data.parser.set(data.parser.find(data.appSettings.selectedParser))
                    }

                    appSettingWatcher = globalDb.watch("AppSettings");
                    let _parsers = data.appSettings.parsers ?? [];
                    appSettingWatcher.onSave = async (items: any) => {
                        let item: AppSettings = items?.firstOrDefault();
                        if (item) {
                            let updateParser = _parsers.length != (item.parsers ?? []).length || _parsers.some((x, index) => {
                                let p1 = (item.parsers ?? [])[index];
                                let p2 = x;
                                if (!p1 || !p2 || p1.name != p2.name || p1.content !== p2.content)
                                    return true;
                                return false;
                            });
                            _parsers = [...(item.parsers ?? [])];
                            if (updateParser)
                                console.warn("updateParser")
                            data.appSettings = item;
                            if (updateParser)
                                loadParsers();
                        }
                    };
                    data.selectedThemeIndex = data.appSettings.selectedTheme ?? 0;
                    data.parser.current.settings = (await data.parser.current.load() as any);
                });
                const showSubscription = Keyboard.addListener(
                    "keyboardDidShow",
                    () => {
                        data.KeyboardState = true;
                    }
                );
                const hideSubscription = Keyboard.addListener(
                    "keyboardDidHide",
                    () => {
                        data.KeyboardState = false;
                    }
                );

                let windowEvent = Dimensions.addEventListener("change", e => {
                    data.size = { ...e };
                });

                const backGroundSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
                    console.log('AppState changed to:', nextAppState);
                    if (data.appState.state.match(/active/) && nextAppState.match(/background|inactive/)) {
                        console.log('App has gone to the background!');
                        data.appState.inBackground = true;
                        // Do background logic here
                    } else if (data.appState.state.match(/background|inactive/) && nextAppState === 'active') {
                        data.appState.inBackground = false;
                        console.log('App has come to the foreground!');
                        // Resume logic here
                    }
                    data.appState.state = nextAppState;

                })

                await BGService.start();
                return [
                    ...notification.event,
                    backGroundSubscription,
                    zip.subscribeEvent,
                    hideSubscription,
                    showSubscription,
                    windowEvent,
                    { remove: () => BGService.stop() },
                    { remove: () => context.tts.stop() },
                    {
                        remove: () => appSettingWatcher.removeWatch?.()
                    }
                ];
            } catch (e) {
                console.error(e);
            }

            return [];
        }
    }).ignore(
        "appState.state",
        "tts.female",
        "tts.male",
        "files",
        "imageCache",
        "cache",
        "parser.current",
        "parser.all",
        "nav",
        "selection.downloadSelectedItem",
        "selection.favoritItem",
        "player.currentChapterSettings.scrollProgress",
        "player.book.chapterSettings",
        "player.book.textReplacements",
        "player.currentChapter",
        "player.novel",
        "zip",
        "notification",
        "db",
        "appSettings.currentNovel",
        "appSettings.parsers",
        "novelFavoritInfo",
        "bgService"
    ).globalBuild();
export default data;
