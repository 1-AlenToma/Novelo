import {
    Text,
    View,
    TouchableOpacity,
    useLoader,
    ItemList,
    Icon,
    TextInput,
    ActionSheetButton,
    Web,
    TabBar,
    Slider,
    CheckBox,
    Modal,
    DropdownList,
    ColorPicker,
    FormItem,
    ChapterView,
    ButtonGroup,
    TabView,
    AlertDialog,
    Button,
    ColorSelection,
    PlayerView,
    SafeAreaView
} from "../../components/";
import WebView from "react-native-webview";
import * as React from "react";
import { useNavigation } from "../../hooks";
import { DetailInfo, ChapterDetail, ChapterInfo } from "../../native";
import Header from "../../pages/Header";
import { Book } from "../../db";
import { invertColor } from "../../Methods";
import { useKeepAwake } from "expo-keep-awake";

const WatchAnime = (props: any) => {
    const [{ name, url, parserName, epub, chapter }, nav] = useNavigation(props);
    const loader = useLoader(true, "Loading please wait");
    useKeepAwake();
    const parser = context.parser.find(parserName);
    const state = buildState(() =>
    ({
        book: undefined as Book | undefined,
        anime: undefined as DetailInfo | undefined,
        chapterDetail: undefined as ChapterDetail | undefined,
        selectedChapter: undefined as ChapterInfo | undefined,
        displayHeader: true,

    })).ignore("anime", "book", "chapterDetail").build();

    const actionSheet = useRef({
        onChange: (visibility) => {
            state.displayHeader = !visibility;
        }
    })
    const fetchData = async () => {
        try {
            loader.show();
            let anime = await parser.detail(url);
            let book = await context.db.Books.query.load("chapterSettings").where.column(x => x.url).equalTo(url).and.column(x => x.parserName).equalTo(parserName).findOrSave(
                Book.n()
                    .Url(anime.url)
                    .Name(anime.name)
                    .ParserName(parserName)
                    .ImageBase64(await context.http().imageUrlToBase64(anime.image)));
            context.appSettings.currentNovel = {
                url: url,
                parserName: parserName,
                isEpub: false
            };

            if (context.player) {
                context.player.stop?.();
                context.player.showPlayer = false;
            }

            await context.appSettings.saveChanges();
            state.anime = anime;
            state.book = book;
            state.chapterDetail = (await parser.chapter(url)) as ChapterDetail;
            await loadChapter(chapter);

        } catch (e) {
            AlertDialog.alert({ message: e, title: "Error" });
        }

    }

    const loadChapter = async (chapter: string | number) => {
        loader.show();
        if (state.anime && state.book) {
            let cIndex = state.book.selectedChapterIndex ?? 0;
            if (chapter && typeof chapter == "string")
                cIndex = state.anime.chapters.findIndex(x => x.url == chapter);
            else if (chapter)
                cIndex = chapter as number;
            if (cIndex >= 0) {
                state.book.selectedChapterIndex = cIndex;
                await state.book.saveChanges();
                state.selectedChapter = state.anime.chapters[cIndex];
            }
        }

    }


    useEffect(() => {
        context.isFullScreen = true;
        fetchData();
        return () => {
            context.isFullScreen = false;
        }
    }, [])

    const onMassage = (data) => {
        let item = JSON.parse(data) as { type: string, data: any }
        switch (item.type) {
            case "click":
                state.displayHeader = !state.displayHeader;
                break;
            case "loaded":
                loader.hide();
        }
    }




    let css = `
        .videoSize, iframe, #jwppp-video- {
            width: 100% !important;
            height: 50vh !important;
            max-width: 100% !important;
            max-height: 50vh !important;
            overflow:hidden !important;
        }
    `

    return (
        <View css="flex"
            style={{
                zIndex: 100,
                backgroundColor: context.appSettings.backgroundColor
            }}>
            {
                state.chapterDetail && state.selectedChapter ? (<>
                    <Header css={`boc:${invertColor(context.appSettings.backgroundColor)}`} {...props} buttons={[
                        {
                            text: (
                                <ActionSheetButton
                                    ready={false}
                                    title="Chapters"
                                    size="95%"
                                    refItem={actionSheet}
                                    btn={
                                        <Icon
                                            type="MaterialCommunityIcons"
                                            name="menu"
                                        />
                                    }
                                >
                                    <ChapterView
                                        book={state.book}
                                        novel={state.anime}
                                        onPress={item => {
                                            console.warn(item)
                                            loadChapter(item.url);
                                        }}
                                        current={state.selectedChapter.url}
                                    />
                                </ActionSheetButton>
                            )
                        }
                    ]} />

                    <View ifTrue={state.displayHeader} css={`bac:${context.appSettings.backgroundColor} flex-1`}>
                        {loader.elem}
                        <WebView
                            injectedJavaScript={`

                        window.postmsg = (type, data) => {
                        const item = { type, data };
                        if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify(item))
                        }
                       }
                        window.sleep=(ms)=> {
                            return new Promise(r=> setTimeout(r,ms || 100));
                        }
                        
                        if (${state.chapterDetail.css && state.chapterDetail.css.length > 0 ? "1==1" : "1==0"}){
                             let style = document.createElement("style");
                             style.appendChild(document.createTextNode("${state.chapterDetail.css.replace(/(\r\n|\n|\r)/gm, "")}"));
                             document.head.appendChild(style);
                        }

                             let style = document.createElement("style");
                             style.appendChild(document.createTextNode("${css.replace(/(\r\n|\n|\r)/gm, "")}"));
                             document.head.appendChild(style);
                        
                        ${state.chapterDetail.script}

                        window.addEventListener('click', function (event) {
                            const execluded = ${JSON.stringify(state.chapterDetail.clickExceptions ?? [])};
                            let target = event.target;
                            let found = false;
                            for(let item of execluded){
                                if (target.closest(item))
                                    {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found)
                            window.postmsg("click", true);
                        });

                        const videoCheck = async ()=> {
                            while(document.querySelector("video") == null)
                             await window.sleep(100);
                            const video = document.querySelector("video");
                            //video.parentElement.classList.add("videoSize")

                         window.postmsg("loaded", true);
                        }

                        videoCheck();
                        true;
                     `}
                            onNavigationStateChange={(event) => {
                                if (event.url !== state.selectedChapter.url) {

                                }
                                return false;
                            }}
                            nestedScrollEnabled={true}
                            cacheEnabled={true}
                            source={{
                                uri: state.selectedChapter.url
                            }}
                            contentMode="mobile"
                            scalesPageToFit={true}
                            originWhitelist={["*"]}
                            scrollEnabled={true}
                            userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
                            setSupportMultipleWindows={false}
                            style={[
                                {
                                    backgroundColor: context.appSettings.backgroundColor
                                }
                            ]}
                            containerStyle={[
                                {
                                    backgroundColor: context.appSettings.backgroundColor,
                                    zIndex: 70,
                                    flex: 0,
                                    flexGrow: 1,

                                }]}
                            onMessage={({ nativeEvent }) => onMassage(nativeEvent.data)}
                            allowFileAccess={true}
                            allowFileAccessFromFileURLs={true}
                            allowUniversalAccessFromFileURLs={true}
                            javaScriptEnabled={true}
                            allowsFullscreenVideo={true}
                        />
                    </View>
                </>) : loader.elem
            }
        </View>
    )

}

export default WatchAnime;