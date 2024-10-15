import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup,
  FText,
  TextInput,
  SizeAnimator,
  ActionSheet,
  ActionSheetButton,
  TabBar,
  ChapterView,
  HomeNovelItem
} from "../../components/";
import WebView from "react-native-webview";
import * as React from "react";
import {
  ScrollView,
  Linking
} from "react-native";
import { useNavigation } from "../../hooks";
import Header from "../../pages/Header";
import { Book, Chapter } from "../../db";
import {DetailInfo} from "../../native"

export default ({ ...props }: any) => {
  const [{ url, parserName }, options, navop] =
    useNavigation(props);
  const loader = useLoader(true);
  const chapterRef = useRef();
  const state = buildState(
    {
      novel: {} as DetailInfo,
      viewChapters: false,
      cText: "",
      infoLoading: false,
      book: {} as Book | undefined,
      authorNovels: [] as any[]
    }).ignore(
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
      let parser =
        context.parser.find(parserName);
      state.authorNovels =
        await parser.getByAuthor(
          state.novel.authorUrl
        );
      loader.hide();
    }
  };

  let fetchData = async () => {
    loader.show();
    let parser = context.parser.find(parserName);
    try {
      if (parser && url) {
        let novel = await parser.detail(
          url,
          true
        );
        state.novel = novel ?? {};
        if (novel) {
          state.book = await context
            .db()
            .querySelector<Book>("Books")
            .LoadChildren<Chapter>(
              "Chapters",
              "parent_Id",
              "id",
              "chapterSettings",
              true
            )
            .Where.Column(x => x.url)
            .EqualTo(url)
            .AND.Column(x => x.parserName)
            .EqualTo(parserName)
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
  };

  let loadInfo = async (novel: any) => {
    try {
      return;
      state.infoLoading = true;
      if (novel && (novel.name?.has() ?? false)) {
        let item = await context.parser
          .find(parserName)
          .novelInfo(novel, true);
        if (item) {
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
      rootView={true}
      css="flex">
      <Header
        {...props}
        titleCss="fos:12"
        buttons={[
          {
            ifTrue:
              state.novel.novelUpdateUrl?.has() ??
              false,
            text: (
              <Icon
                invertColor={true}
                type="Octicons"
                name="browser"
              />
            ),
            press: () =>
              Linking.openURL(
                state.novel.novelUpdateUrl
              )
          }
        ]}
        title={state.novel?.name}
      />
      {loader.elem}
      <TabBar
        ifTrue={()=> !state.novel.name?.empty()}
        position="Top"
        fontSize={9}>
        <View
          css="flex mah:99% juc:flex-end"
          disableScrolling={true}
          icon={{
            name: "info-circle",
            type: "FontAwesome"
          }}>
          <View css="flex mat:10">
            <ScrollView>
              <View css="flex ali:center">
                <View
                  css="row box"
                  invertColor={true}>
                  <Image
                    resizeMethod="scale"
                    url={state.novel?.image}
                    css="resizeMode:contain he:100% wi:150 bor:5"
                  />
                  <View css="flex pa:5">
                    <Text
                      selectable={true}
                      css="header flex flg:1 fos:18"
                      invertColor={true}>
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
                      ifTrue={()=>state.novel.novelUpdateRating?.has()}
                      invertColor={true}
                      css="desc">
                      NovelUpdateRating:
                      {state.novel?.novelUpdateRating?.sSpace()}
                    </Text>
                    <Text
                      ifTrue={()=> state.novel.rating?.has()}
                      invertColor={true}
                      css="desc">
                      Rating:
                      {state.novel?.rating?.sSpace()}
                    </Text>
                    <Text
                      ifTrue={()=> state.novel.status?.has() }
                      invertColor={true}
                      css="desc">
                      Status:
                      {state.novel?.status?.sSpace()}
                    </Text>
                    <Text
                      ifTrue={()=> state.novel.alternativeNames?.has()}
                      invertColor={true}
                      css="desc">
                      AlternativeNames:
                      {state.novel?.alternativeNames?.toString()?.sSpace()}
                    </Text>
                    <Text
                      ifTrue={()=> state.novel.author?.has()}
                      invertColor={true}
                      css="desc">
                      Created By:
                      {state.novel?.author?.sSpace()}
                    </Text>
                    <Text
                      ifTrue={()=>state.novel.lastUpdated?.has()}
                      invertColor={true}
                      css="desc">
                      Last Update:
                      {state.novel?.lastUpdated?.sSpace()}
                    </Text>
                  </View>
                </View>
                <View
                  css="box pal:10 par:10 mih:30"
                  ifTrue={()=>state.novel.genre?.has() || state.novel.tags?.has()}
                  invertColor={true}>
                  <View css="he:29 clearwidth">
                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={{
                        height: 28
                      }}>
                      <View css="row wi:100%">
                        {state.novel.genre?.map(
                          (x, i) => (
                            <TouchableOpacity
                              onPress={() => {
                                options
                                  .nav("Search")
                                  .add({
                                    genre: x,
                                    parserName
                                  })
                                  .push();
                              }}
                              css="bor:10 flex juc:center mar:5 boc:#c5bebe bow:0.5 pal:8 par:8"
                              key={i}>
                              <Text
                                css="desc fos:15"
                                invertColor={
                                  true
                                }>
                                #{x}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </ScrollView>
                  </View>
                  <View
                    ifTrue={()=> state.novel.tags?.has()}
                    css="he:29 mat:6 clearwidth">
                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={{
                        height: 28
                      }}>
                      <View css="row wi:100%">
                        {state.novel.tags?.map(
                          (x, i) => (
                            <TouchableOpacity
                              invertColor={false}
                              activeOpacity={1}
                              css="bor:10 flex juc:center mar:5 boc:#c5bebe bow:0.5 pal:8 par:8"
                              key={i}>
                              <Text
                                css="desc fos:15"
                                invertColor={
                                  false
                                }>
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
                  css="box pal:10 par:10"
                  invertColor={true}>
                  <FText
                    css="desc fos:14 lih:20 pab:10"
                    invertColor={true}
                    selectable={true}
                    text={state.novel.decription?.cleanHtml()}
                  />
                  <View css="botw:1 row pat:5 pab:5 botc:gray clearwidth juc:space-between ali:center">
                    <Text
                      ifTrue={()=> state.novel.chapters?.has()}
                      invertColor={true}
                      css="desc fos:15">
                      {state.novel.chapters
                        ?.length + " Chapter "}
                      {(
                        state.novel.status || ""
                      ).has("Completed")
                        ? "Completed"
                        : "Updated"}
                    </Text>
                    <ActionSheetButton
                      refItem={chapterRef}
                      btn={
                        <Icon
                          invertColor={true}
                          type="AntDesign"
                          name="caretright"
                          size={20}
                        />
                      }
                      title="Chapters"
                      height="80%">
                      <ChapterView
                        book={state.book}
                        novel={state.novel}
                        onPress={item => {
                          chapterRef.current?.close();
                          options
                            .nav("ReadChapter")
                            .add({
                              name: state.novel.name,
                              chapter: item.url,
                              url: state.novel
                                .url,
                              parserName:
                                state.novel
                                  .parserName
                            })
                            .push();
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
                  invertColor={true}
                  ifTrue={()=> state.authorNovels?.has()}
                  css="box he:265 pal:10 par:10 juc:flex-start">
                  <Text
                    invertColor={true}
                    css="header fos:18 pab:5">
                    Authors Novels
                  </Text>
                  <ItemList
                    onPress={item => {
                      if (
                        item.url ==
                        state.novel.url
                      )
                        return;
                      options
                        .nav("NovelItemDetail")
                        .add({
                          url: item.url,
                          parserName:
                            item.parserName
                        })
                        .push();
                    }}
                    vMode={false}
                    itemCss={
                      !false
                        ? "boc:#ccc bow:1 he:220 wi:170 mal:5 bor:5 overflow"
                        : "boc:#ccc bow:1 overflow he:170 wi:98% mat:5 mal:5 bor:5"
                    }
                    items={
                      state.authorNovels ?? []
                    }
                    container={HomeNovelItem}
                  />
                </View>
                <View
                  invertColor={true}
                  ifTrue={()=> state.novel.novelUpdateRecommendations?.has()}
                  css="box he:265 pal:10 par:10 juc:flex-start">
                  <Text
                    invertColor={true}
                    css="header pab:5">
                    Recommendations
                  </Text>
                  <ItemList
                    onPress={item => {
                      options
                        .nav("Search")
                        .add({
                          searchTxt: item.name,
                          parserName
                        })
                        .push();
                    }}
                    itemCss="boc:#ccc bow:1 he:220 wi:170 pa:4 mal:5 bor:5 overflow"
                    container={({ item }) => (
                      <View css="clearboth bor:5 overflow">
                        <Image
                          url={item.image}
                          css="resizeMode:contain bor:5 clearwidth wi:100% he:100%"
                        />
                        <View css="clearwidth bottom he:30% overflow">
                          <View css="blur bottom clearboth" />
                          <Text css="clearwidth mih:40% overflow header co:#fff pa:4 tea:center">
                            {item.name}
                          </Text>
                        </View>
                      </View>
                    )}
                    items={
                      state.novel
                        .novelUpdateRecommendations
                    }
                    nested={true}
                    vMode={false}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
          <View css=" juc:flex-start bor:5 mab:10 mat:1 height:60 pab:2">
            <View
              css="row flex he:90% juc:center ali:center"
              ifTrue={
                state.novel.url?.has() ?? false
              }>
              <TouchableOpacity
                css="button mar:5 clearheight juc:center"
                invertColor={true}
                onPress={async () => {
                  context
                    .downloadManager()
                    .download(
                      state.novel.url,
                      state.novel.parserName
                    );
                  context
                    .alert(
                      "novel is downloading",
                      "Attantion"
                    )
                    .show();
                }}>
                <View css="blur" />
                <Icon
                  type="Feather"
                  name="download"
                  invertColor={true}
                  css="mar:0"
                />
              </TouchableOpacity>
              <TouchableOpacity
                css="mar:5 button pa:5 wi:65% clearheight"
                invertColor={true}
                onPress={() => {
                  options
                    .nav("ReadChapter")
                    .add({
                      name: state.novel.name,
                      url: state.novel.url,
                      parserName:
                        state.novel.parserName
                    })
                    .push();
                }}>
                <Text
                  invertColor={true}
                  css="fos:30">
                  READ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                css="button clearheight juc:center mar:0"
                invertColor={true}
                onPress={async () => {
                  loader.show();
                  let book =
                    state.book ||
                    (await context
                      .db()
                      .querySelector<Book>(
                        "Books"
                      )
                      .Where.Column(x => x.url)
                      .EqualTo(url)
                      .AND.Column(
                        x => x.parserName
                      )
                      .EqualTo(parserName)
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
                  await book
                    .Favorit(!book.favorit)
                    .saveChanges();
                  state.book = book;
                  loader.hide();
                }}>
                <View css="blur" />
                <Icon
                  type="Fontisto"
                  name="favorite"
                  invertColor={
                    state.book?.favorit
                      ? undefined
                      : true
                  }
                  css="mar:0"
                  style={{
                    color: state.book?.favorit
                      ? "red"
                      : undefined
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          css="flex"
          disableScrolling={true}
          ifTrue={() =>
            state.novel.commentScript?.script?.has()
          }
          icon={{
            name: "comments",
            type: "FontAwesome"
          }}>
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
            source={{
              uri: state.novel.commentScript?.url
            }}
            contentMode="mobile"
            scalesPageToFit={true}
            originWhitelist={["*"]}
            scrollEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
            setSupportMultipleWindows={false}
            style={[
              {
                flexGrow: 1,
                zIndex: 70,
                flex: 1
              }
            ]}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={
              true
            }
            javaScriptEnabled={true}
          />
        </View>
      </TabBar>
    </View>
  );
};
