import dbContext from "./db/dbContext";
import * as Speech from "expo-speech";
import { AppSettings } from "./db";
import { newId } from "./Methods";
import {
    Player,
    BGService,
    FileHandler,
    HttpHandler,
    DownloadManager,
    ImageCache,
    FilesZipper,
    Notification
} from "./native";
import { Dimensions, Keyboard, LogBox } from "react-native";
import StateBuilder from "react-smart-state";
import { GlobalType, FilesPath } from "./Types";

LogBox.ignoreLogs([
    "fontFamily",
    "require cycles",
    "Require cycle",
    "new NativeEventEmitter",
    "Internal React error",
    "xmldom warning"
]);

import * as ScreenOrientation from "expo-screen-orientation";
import ParserWrapper from "./parsers/ParserWrapper";
const globalDb = new dbContext();
const globalHttp = new HttpHandler();

const parsers = ParserWrapper.getAllParsers() as ParserWrapper[];
let currentParser = parsers[0];
const downloadManager = new DownloadManager();
const cache = new FileHandler(FilesPath.Cache, "Cache");
const imageCache = new ImageCache();
const zip = new FilesZipper();
const notification = new Notification();


const data = StateBuilder<GlobalType>(
    {
        notification,
        zip,
        browser: {
            data: undefined,
            pickFile: (ext, desc) => {
                return new Promise<any | undefined>((success) => {
                    data.browser.data = { desc, func: (f) => success(f), onCancel: success, props: { selectionType: "File", ext } }
                })
            },
            pickFolder: (desc) => {
                return new Promise<any | undefined>((success) => {
                    data.browser.data = { func: (f) => success(f), onCancel: success, desc, props: { selectionType: "Folder" } }
                });
            },
        },
        lineHeight: 2.5,
        selectedFoldItem: "",
        panEnabled: true,
        selection: {
            downloadSelectedItem: undefined,
            favoritItem: undefined
        },
        alertMessage: {
            msg: undefined,
            title: "Action",
            confirm: (answer: boolean) => { }
        },
        novelFavoritInfo: {},
        alert: (msg: string, title?: string) => {
            return {
                show: () => {
                    data.alertMessage.msg = msg;
                    data.alertMessage.title = title;
                    data.alertMessage.confirm = undefined;
                    data.alertMessage.toast = undefined;
                },
                confirm: (func: Function) => {
                    data.alertMessage.msg = msg;
                    data.alertMessage.title = title;
                    data.alertMessage.confirm = func;
                    data.alertMessage.toast = undefined;
                },
                toast: () => {
                    data.alertMessage.msg = msg;
                    data.alertMessage.title = title;
                    data.alertMessage.confirm = undefined;
                    data.alertMessage.toast = true;
                }
            };
        },
        player: {} as Player,
        http: () => globalHttp,
        downloadManager: () => downloadManager,
        KeyboardState: false,
        isFullScreen: false,
        appSettings: new AppSettings(),
        voices: undefined,
        cache: cache,
        files: new FileHandler(FilesPath.File, "File"),
        imageCache: imageCache,
        speech: Speech,
        nav: undefined,
        orientation: (value: "Default" | "LANDSCAPE") => {
            ScreenOrientation.lockAsync(
                value === "Default"
                    ? ScreenOrientation.OrientationLock.DEFAULT
                    : ScreenOrientation.OrientationLock.LANDSCAPE
            );
        },
        parser: {
            current: currentParser,
            find: (name: string) => parsers.find(x => x.name == name) as ParserWrapper,
            set: async (p: any) => {
                p = data.parser.find(p.name)
                p.settings = await p.load();
                data.parser.current = p;
                data.appSettings.selectedParser = p.name;
                await data.appSettings.saveChanges();

                // data.updater = newId();
                //alert(p.name)
            },
            all: () => parsers
        },
        updater: newId(),
        theme: {
            settings: undefined,
            invertSettings: () => { },
            themeMode: "dark",
            getRootTheme: (themeMode) => { },
            textTheme: () => {
                return { color: data.theme.settings?.color };
            },
            viewTheme: () => {
                return {
                    backgroudColor: data.theme.settings?.backgroundColor
                };
            }
        },
        dbContext: () => globalDb,
        db: () => globalDb.database,
        size: {
            window: Dimensions.get("window"),
            screen: Dimensions.get("screen")
        },
        init: async () => {
            try {
                //await globalDb.database.dropTables();

                const loadVoices = (counter?: number) => {
                    setTimeout(
                        async () => {
                            var voices = await Speech.getAvailableVoicesAsync();

                            if (voices.length > 0) data.voices = voices;
                            else {
                                console.log("voices not found");
                                if (!counter || counter < 10)
                                    loadVoices((counter ?? 0) + 1);
                            }
                        },
                        (counter ?? 1) * 300
                    );
                };
                await globalDb.database.setUpDataBase();
                await globalDb.database.migrateNewChanges();
                data.appSettings = await globalDb.database
                    .querySelector<AppSettings>("AppSettings")
                    .findOrSave(data.appSettings);
                if (data.appSettings.filesDataLocation && !data.appSettings.filesDataLocation.empty()) {
                    data.files = new FileHandler(data.appSettings.filesDataLocation.path(FilesPath.File));
                    data.imageCache = new ImageCache(data.appSettings.filesDataLocation.path(FilesPath.Images))
                }
                if (data.parser.find(data.appSettings.selectedParser)) {
                    data.parser.set(data.parser.find(data.appSettings.selectedParser))
                }
                let appSettingWatcher = globalDb.database.watch("AppSettings");
                appSettingWatcher.onSave = async items => {
                    let item = items?.firstOrDefault();
                    if (item) data.appSettings = item;
                };
                data.theme.themeMode = data.appSettings.theme;
                loadVoices();
                data.parser.current.settings = await data.parser.current.load();
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

                await BGService.start();
                return [
                    ...notification.event,
                    zip.subscribeEvent,
                    hideSubscription,
                    showSubscription,
                    windowEvent,
                    { remove: () => BGService.stop() },
                    {
                        remove: () => appSettingWatcher.removeWatch()
                    }
                ];
            } catch (e) {
                console.error(e);
            }

            return [];
        }
    }).ignore(
        "files",
        "imageCache",
        "cache",
        "parser.current",
        "nav",
        "voices",
        "selection.downloadSelectedItem",
        "selection.favoritItem",
        "player.currentChapterSettings.scrollProgress",
        "player.book.chapterSettings",
        "player.novel",
        "zip",
        "notification"
    ).globalBuild();
export default data;
