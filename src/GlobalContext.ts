import dbContext from "./db/dbContext";
import * as Speech from "expo-speech";
import { AppSettings } from "./db";
import { newId } from "./Methods";
import DownloadManager from "./native/DownloadManager"
import {
    Player,
    BGService,
    FileHandler,
    HttpHandler,
    ImageCache,
    FilesZipper,
    Notification,
    Value, ChapterInfo, LightInfo, DetailInfo, ParserDetail, SearchDetail, Parser, Html
} from "./native";
import { Dimensions, Keyboard, LogBox } from "react-native";
import StateBuilder from "react-smart-state";
import { GlobalType, FilesPath } from "./Types";
import * as ScreenOrientation from "expo-screen-orientation";
import ParserWrapper from "./parsers/ParserWrapper";

LogBox.ignoreLogs([
    "fontFamily",
    "require cycles",
    "Require cycle",
    "new NativeEventEmitter",
    "Internal React error",
    "xmldom warning"
]);


const globalDb = new dbContext();
const globalHttp = new HttpHandler();

let currentParser = ParserWrapper.getAllParsers("ReadNovelFull") as ParserWrapper;
const downloadManager = new DownloadManager();
const cache = new FileHandler(FilesPath.Cache, "Cache");
const zip = new FilesZipper();
const notification = new Notification();
const privateData = new FileHandler(FilesPath.Private, "File");
const debugMode = false;

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
        player: {} as Player,
        http: () => globalHttp,
        downloadManager: () => downloadManager,
        KeyboardState: false,
        isFullScreen: false,
        appSettings: new AppSettings(),
        voices: undefined,
        cache: cache,
        files: new FileHandler(FilesPath.File, "File", true),
        imageCache: new ImageCache(),
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
            default: "ReadNovelFull",
            parseCode: (code: string) => {
                const parserItem = {
                    Value, ChapterInfo, LightInfo, DetailInfo, ParserDetail, SearchDetail, Parser, Html, HttpHandler
                }
                if (code && code.length > 0) {
                    let className = (code.match(/(.*)\.(prototype.detail)/gim)?.firstOrDefault() ?? "") as string;
                    className = className.safeSplit(".", 0).trim()
                    let runnalbe: any = eval(`(function(require){ ${code} \n return ${className}})`);
                    return runnalbe?.(() => parserItem);
                }
                return undefined as any
            },
            current: currentParser,
            find: (name: string) => data.parser.all.find(x => x.name == name) as ParserWrapper,
            set: async (p: any) => {
                p = data.parser.find(p.name)
                p.settings = await p.load();
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
        init: async () => {
            try {
                //await globalDb.database.dropTables();
                let currentParserString: string = "";
                const loadParsers = async () => {
                    if (debugMode) {
                        data.parser.all = ParserWrapper.getAllParsers() as ParserWrapper[];
                        return;
                    }
                    const defaultParser = ParserWrapper.getAllParsers(data.parser.default) as ParserWrapper;
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
                        await context.speech.stop();

                    }
                }

                const loadVoices = (counter?: number) => {
                    setTimeout(
                        async () => {
                            const filename = "voices.json";
                            let voices = await Speech.getAvailableVoicesAsync();
                            if (voices.length <= 0) {
                                let localVoices = await privateData.read(filename);
                                voices = localVoices && localVoices.has() ? JSON.parse(localVoices) : voices;
                            }

                            if (voices.length > 0) {
                                data.voices = voices;
                                await privateData.write(filename, JSON.stringify(voices));
                            }
                            else {
                                console.log("voices not found");
                                if (!counter || counter < 10)
                                    loadVoices((counter ?? 0) + 1);
                            }
                        },
                        (counter ?? 1) * 300
                    );
                };
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

                let appSettingWatcher = globalDb.watch("AppSettings");
                appSettingWatcher.onSave = async items => {
                    let item = items?.firstOrDefault();
                    if (item) {
                        data.appSettings = item as any;
                        loadParsers();
                    }
                };
                data.selectedThemeIndex = data.appSettings.selectedTheme ?? 0;
                loadVoices();
                data.parser.current.settings = (await data.parser.current.load() as any);
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
        "parser.all",
        "nav",
        "voices",
        "selection.downloadSelectedItem",
        "selection.favoritItem",
        "player.currentChapterSettings.scrollProgress",
        "player.book.chapterSettings",
        "player.novel",
        "zip",
        "notification",
        "db",
        "appSettings.currentNovel",
        "appSettings.parsers"
    ).globalBuild();
export default data;
