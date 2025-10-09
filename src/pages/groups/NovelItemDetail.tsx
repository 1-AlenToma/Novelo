import {
  useLoader,
  Image,
  ItemList,
  ActionSheetButton,
  ChapterView,
  ExpandableDescription
} from "../../components/";
import { View, Text, Icon, AlertDialog, Modal, TabBar, TabView, TouchableOpacity } from "react-native-short-style";
import HomeNovelItem from "../../components/HomeNovelItem";
import WebView from "react-native-webview";
import * as React from "react";
import {
  ScrollView,
  RefreshControl
} from "react-native";
import { useNavigation } from "../../hooks";
import Header from "../../pages/Header";
import { Book } from "../../db";
import { DetailInfo } from "../../native"

export default ({ ...props }: any) => {
  const [{ url, parserName }] =
    useNavigation(props);
  const loader = useLoader(true);
  const chapterRef = useRef();
  const state = buildState(() =>
  (
    {
      novel: {} as DetailInfo,
      viewChapters: false,
      cText: "",
      infoLoading: false,
      book: {} as Book | undefined,
      authorNovels: [] as any[],
      showNovelUpdateWebView: false
    })).ignore(
      "book",
      "novel",
      "authorNovels"
    ).build();

  let fetchAuthorNovels = async () => {
    //alert(state.novel.authorUrl);
    if (
      !state.authorNovels?.has() &&
      state.novel.authorUrl?.has()
    ) {
      loader.show();
      let parser = context.parser.find(parserName);
      state.authorNovels = await parser.getByAuthor(state.novel.authorUrl);
      loader.hide();
    }
  };

  let fetchData = async (refresh?: boolean) => {
    loader.show();
    await state.batch(async () => {
      let parser = context.parser.find(parserName);
      try {
        if (parser && url) {
          let novel = await parser.detail(url, true, refresh ? "RenewMemo" : undefined);
          state.novel = novel ?? {} as any;
          if (novel) {
            state.book = await context
              .db.Books.query.load("chapterSettings")
              .where.column(x => x.url)
              .equalTo(url)
              .and.column(x => x.parserName)
              .equalTo(parserName)
              .firstOrDefault();
          }

          if (parser.infoEnabled) loadInfo(novel);
          await fetchAuthorNovels();
        }
      } catch (e) {
        console.error(e);
      } finally {
        loader.hide();
      }
    });
  };

  let loadInfo = async (novel: any) => {
    try {
      //return;
      state.infoLoading = true;
      if (novel && (novel.name?.has() ?? false)) {
        let item = await context.parser.find(parserName).novelInfo(novel, true);
        if (item && item.name) {
          state.novel = item;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      state.infoLoading = false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //console.warn([state.novel].niceJson("chapters"), state.novel.alternativeNames?.has() )
  return (
    <View
      css="flex root">
      <Modal addCloser={true} css="he-90% wi-95%" isVisible={state.showNovelUpdateWebView} onHide={() => state.showNovelUpdateWebView = false}>
        <View css="flex mat-30 mab-10">
          <WebView
            injectedJavaScript={methods.injectCSS(`.pgAdWrapper, #div-gpt-ad-noid_blank {
              display:none !important; visibility: hidden;opacity:0;
              }`)}
            nestedScrollEnabled={true}
            cacheEnabled={true}
            source={{
              uri: state.novel.novelUpdateUrl
            }}
            contentMode="mobile"
            scalesPageToFit={true}
            originWhitelist={["*"]}
            scrollEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
            setSupportMultipleWindows={false}
            style={
              {
                flexGrow: 1,
                zIndex: 70,
                flex: 1
              }
            }
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            javaScriptEnabled={true}
          />
        </View>
      </Modal>
      <Header
        {...props}
        titleCss="fos:12"
        buttons={[
          {
            ifTrue: state.novel.novelUpdateUrl?.has() ?? false,
            text: (
              <Icon type="Octicons" name="browser" />
            ),
            press: () => state.showNovelUpdateWebView = true
          }
        ]}
        title={state.novel?.name}
      />
      {loader.elem}
      <TabBar
        header={{
          style: "invert",
          textStyle: "invert",
          overlayStyle: {
            content: context.selectedThemeIndex == 1 ? "bac-#000" : "bac-#CCCCCC"
          }
        }}
        ifTrue={() => !state.novel.name?.empty()}
        position="Top">
        <TabView
          css="flex mah:99% juc:flex-end"
          disableScrolling={true}
          icon={{
            name: "info-circle",
            type: "FontAwesome",
            css: "invert"
          }}>
          <View css="flex mat:10">
            <ScrollView refreshControl={
              <RefreshControl refreshing={loader.loading} onRefresh={() => fetchData(true)} />}>
              <View css="flex ali:center">
                <View
                  css="row box invert">
                  <Image url={state.novel?.image} css="resizeMode:contain he:100% wi:150 bor:5 zi-1" />
                  <Text css="absolute le-15 to-10 pa-2 bor-5 bac-#ffa000 co-white zi-2" ifTrue={state.novel.langType?.has() ?? false}>{state.novel.langType}</Text>
                  <View css="flex pa:5 invert">
                    <Text
                      selectable={true}
                      css="header flex flg:1 fos:18">
                      {state.novel.name}
                      <Text
                        css="desc co:#775903 clearwidth"
                        ifTrue={
                          state.infoLoading
                        }>
                        {"\n"}
                        Looking for info in
                        NovelUpdate...
                      </Text>
                    </Text>

                    <Text
                      ifTrue={() => state.novel.novelUpdateRating?.has()}
                      css="desc" numberOfLines={1}>
                      {context.parser.find(state.novel.parserName)?.infoGeneratorName}Rating:
                      {state.novel?.novelUpdateRating?.normilzeStr().sSpace()}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ifTrue={() => state.novel.rating?.has()}
                      css="desc">
                      Rating:
                      {state.novel?.rating?.normilzeStr().sSpace()}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ifTrue={() => state.novel.status?.has()}
                      css="desc">
                      Status:
                      {state.novel?.status?.normilzeStr().sSpace()}
                    </Text>
                    <Text
                      numberOfLines={2}
                      ifTrue={() => state.novel.alternativeNames?.has()}
                      css="desc">
                      AlternativeNames:
                      {state.novel?.alternativeNames?.toString()?.sSpace()}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ifTrue={() => state.novel.author?.has()}
                      css="desc">
                      Created By:
                      {state.novel?.author?.normilzeStr().sSpace()}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ifTrue={() => state.novel.lastUpdated?.has()}
                      css="desc">
                      Last Update:
                      {state.novel?.lastUpdated?.normilzeStr().sSpace()}
                    </Text>
                  </View>
                </View>
                <View
                  css="box pal:10 par:10 mih:30 invert"
                  ifTrue={() => state.novel.genre?.has() || state.novel.tags?.has()}>
                  <View css="he:29 clearwidth">
                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={{
                        height: 28
                      }}>
                      <View css="row wi:100% invert">
                        {state.novel.genre?.map(
                          (x, i) => (
                            <TouchableOpacity
                              onPress={() => {
                                context
                                  .nav.navigate("Search", {
                                    genre: x,
                                    parserName
                                  });
                              }}
                              css="bor:10 flex juc:center mar:5 boc:#c5bebe bow:0.5 pal:8 par:8 invert"
                              key={i}>
                              <Text
                                css="desc fos:15">
                                #{x}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </ScrollView>
                  </View>
                  <View
                    ifTrue={() => state.novel.tags?.has()}
                    css="he:29 mat:6 clearwidth">
                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={{
                        height: 28
                      }}>
                      <View css="row wi:100% invert">
                        {state.novel.tags?.map(
                          (x, i) => (
                            <TouchableOpacity
                              onPress={() => {
                                context
                                  .nav.navigate("Search", {
                                    searchTxt: `#${x}`,
                                    parserName
                                  });
                              }}
                              css="bor:10 flex juc:center mar:5 boc:#c5bebe bow:0.5 pal:8 par:8 invert"
                              key={i}>
                              <Text
                                css="desc fos:15">
                                #{x}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </ScrollView>
                  </View>
                </View>
                <View
                  css={`box pal:10 par:10 invert ${state.novel.decription?.has() ? "" : "mih-20"}`}>
                  <View css="mih-200">
                    <ExpandableDescription ifTrue={state.novel.decription?.has() ?? false} text={state.novel.decription} numberOfLines={5} />
                  </View>

                  <View css={`botw-${state.novel.decription?.has() ? "1" : "0"} row pat:5 pab:5 botc:gray clearwidth juc:space-between ali:center invert`}>
                    <Text
                      ifTrue={() => state.novel.chapters?.has() ?? false}
                      css="desc fos:15">
                      {(state.novel.chapters
                        ?.length ?? "") + " Chapter "}
                      {(
                        state.novel.status || ""
                      ).has("Completed")
                        ? "Completed"
                        : "Updated"}
                    </Text>
                    <ActionSheetButton
                      ready={false}
                      refItem={chapterRef}
                      btn={
                        <Icon
                          type="AntDesign"
                          name="caret-right"
                          css="invertco"
                          size={20}
                        />
                      }
                      title="Chapters"
                      size="80%">
                      <ChapterView
                        ignoreChapterValidation={true}
                        book={state.book}
                        novel={state.novel}
                        onPress={item => {
                          chapterRef.current?.close();
                          context
                            .nav.navigate(state.novel.type == "Anime" || context.parser.find(state.novel.parserName)?.type == "Anime" ? "WatchAnime" : "ReadChapter", {
                              name: state.novel.name,
                              chapter: item.url,
                              url: state.novel.url,
                              parserName: state.novel.parserName
                            });
                        }}
                        current={
                          state.novel?.chapters?.at(
                            state.book
                              ?.selectedChapterIndex ?? 0
                          )?.url
                        }
                      />
                    </ActionSheetButton>
                  </View>
                </View>
                <View
                  ifTrue={() => (state.authorNovels ?? []).filter(x => x.url != state.novel?.url).has()}
                  css="box he:265 pal:10 par:10 juc:flex-start invert">
                  <Text
                    css="header fos:18 pab:5">
                    Authors Others Novels
                  </Text>
                  <ItemList
                    onPress={item => {
                      context.nav.navigate("NovelItemDetail", {
                        url: item.url,
                        parserName: item.parserName
                      });
                    }}
                    vMode={false}
                    itemCss={
                      "boc:#ccc bow:1 he:220 wi:170 mal:5 bor:5 overflow"
                    }
                    items={
                      (state.authorNovels ?? []).filter(x => x.url != state.novel?.url)
                    }
                    container={HomeNovelItem}
                  />
                </View>
                <View
                  ifTrue={() => state.novel.novelUpdateRecommendations?.has()}
                  css="box mih:265 pal:10 par:10 juc:flex-start invert">
                  <Text
                    css="header fos:18 pab:5">
                    Recommendations
                  </Text>
                  <ItemList
                    onPress={item => {
                      if (!item.parserName) {
                        context
                          .nav.navigate("Search", {
                            searchTxt: item.name,
                            parserName
                          });
                      } else {
                        context
                          .nav.navigate("NovelItemDetail", {
                            url: item.url,
                            parserName: item.parserName
                          });
                      }
                    }}
                    itemCss={!((state.novel.novelUpdateRecommendations?.firstOrDefault("image") ?? "").toString().has()) ? "wi-95% he-40 shadow-lg invert juc-center bac-transparent bobw-0.4 boc-gray" : "boc:#ccc bow:1 he:220 wi:170 mal:5 bor:5 overflow"}
                    container={({ item, index }: any) => {
                      if (item.image?.has())
                        return <HomeNovelItem item={item} vMode={false} />
                      return <Text css="fow-bold fos-15 pal-10">{item.name}</Text>
                    }
                    }
                    items={
                      state.novel.novelUpdateRecommendations
                    }
                    nested={true}
                    vMode={!((state.novel.novelUpdateRecommendations?.firstOrDefault("image") ?? "").toString().has())}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
          <View css=" juc:flex-start bor:5 mab:10 mat:1 height:60 pab:2">
            <View
              css="row flex he:90% juc:center ali:center"
              ifTrue={
                (state.novel.url?.has() ?? false)
              }>
              <TouchableOpacity
                ifTrue={["Novel", "Manga"].includes(context.parser.find(state.novel.parserName)?.type)}
                css="button mar:5 clearheight juc:center invert"
                onPress={async () => {
                  context
                    .downloadManager().download(
                      state.novel.url,
                      state.novel.parserName
                    );
                  AlertDialog
                    .alert(
                      {
                        message: "novel is downloading",
                        title: "Attantion"
                      }
                    );
                }}>
                <View css="blur" />
                <Icon
                  type="Feather"
                  name="download"
                  css="mar:0 invert"
                />
              </TouchableOpacity>
              <TouchableOpacity
                css="mar:5 button pa:5 wi:65% clearheight invert"
                onPress={() => {
                  context
                    .nav.navigate(state.novel.type == "Anime" || context.parser.find(state.novel.parserName)?.type == "Anime" ? "WatchAnime" : "ReadChapter", {
                      name: state.novel.name,
                      url: state.novel.url,
                      parserName: state.novel.parserName
                    });
                }}>
                <Text
                  css="fos:30 tea-center wi-100%">
                  {state.novel.type == "Anime" || context.parser.find(state.novel.parserName)?.type == "Anime" ? "Watch" : "Read"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                css="button clearheight juc:center mar:0 invert"
                onPress={async () => {
                  loader.show();
                  let book =
                    state.book ||
                    (await context
                      .db.Books.query
                      .where.column(x => x.url)
                      .equalTo(url)
                      .and.column(
                        x => x.parserName
                      )
                      .equalTo(parserName)
                      .findOrSave(
                        Book.n()
                          .Url(state.novel.url)
                          .Name(state.novel.name)
                          .ParserName(parserName)
                          .ImageBase64(
                            await context
                              .http()
                              .imageUrlToBase64(
                                state.novel.image
                              )
                          )
                      ));
                  await book.set("favorit", !book.favorit).saveChanges();
                  if (context.player && context.player.book?.id == book.id) {
                    context.player.book.favorit = book.favorit;
                  }
                  state.book = book;
                  loader.hide();
                }}>
                <View css="blur" />
                <Icon
                  type="Fontisto"
                  name="favorite"
                  css="mar:0 invert"
                  style={state.book?.favorit ? {
                    color: "red"
                  } : undefined}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TabView>

        <TabView
          css="flex ali-center invert pat-10 pab-10"
          disableScrolling={true}
          ifTrue={() =>
            state.novel.commentScript?.script?.has()
          }
          icon={{
            name: "comments",
            type: "FontAwesome",
            css: "invert"
          }}>
          <View css="flex wi-95% bac-transparent">
            <WebView
              injectedJavaScript={`
            window.sleep=(ms)=> {
              return new Promise((r)=> setTimeout(r,ms))
            }
            try{
            ${state.novel.commentScript?.script}
            }catch(e){
              //alert(e)
            }
            true;
            `}
              nestedScrollEnabled={true}
              cacheEnabled={true}
              thirdPartyCookiesEnabled={true}
              mixedContentMode='always'
              sharedCookiesEnabled={true}
              source={{
                uri: state.novel.commentScript?.url
              }}
              contentMode="mobile"
              scalesPageToFit={true}
              originWhitelist={["*"]}
              scrollEnabled={true}
              userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
              setSupportMultipleWindows={false}
              style={
                {
                  flexGrow: 1,
                  zIndex: 70,
                  flex: 1,

                }
              }
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={
                true
              }
              javaScriptEnabled={true}
            />
          </View>
        </TabView>
      </TabBar>
    </View>
  );
};
