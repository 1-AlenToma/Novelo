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
  ActionSheetButton
} from "../../components/";
import { useEffect, useRef } from "react";
import {
  ScrollView,
  Linking
} from "react-native";
import { useNavigation } from "../../hooks";
import { useState } from "../../native";
import g from "../../GlobalContext";
import Header from "../../pages/Header";
import { Book } from "../../db";

export default ({ ...props }: any) => {
  const [{ url, parserName }, options, navop] =
    useNavigation(props);
  const loader = useLoader(true);
  const state = useState({
    novel: {},
    viewChapters: false,
    cText: "",
    infoLoading: false,
    book: {}
  });
  let fetchData = async () => {
    loader.show();
    try {
      let parser = g.parser.find(parserName);
      if (parser && url) {
        let novel = await parser.detail(url);
        state.novel = novel ?? {};
        loadInfo(novel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loader.hide();
    }
  };

  let loadInfo = async (novel: any) => {
    try {
      state.infoLoading = true;
      if (novel && (novel.name?.has() ?? false)) {
        let item = await g.parser
          .find(parserName)
          .novelInfo(novel);
        if (item) {
          state.novel = item;
          state.book = await g
            .db()
            .querySelector<Book>("Books")
            .Where.Column(x => x.url)
            .EqualTo(url)
            .AND.Column(x => x.parserName)
            .EqualTo(parserName)
            .firstOrDefault();
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

  return (
    <View
      rootView={true}
      css="flex pab:70">
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
                  css="header flex flg:1 bold fos:18"
                  invertColor={true}>
                  {state.novel.name}
                  <Text
                    css="desc bold co:#775903 clearwidth"
                    ifTrue={state.infoLoading}>
                    {"\n"}
                    Looking for info in
                    NovelUpdate...
                  </Text>
                </Text>

                <Text
                  ifTrue={
                    state.novel.novelUpdateRating?.has() ??
                    false
                  }
                  invertColor={true}
                  css="desc bold">
                  NovelUpdateRating:
                  {state.novel?.novelUpdateRating?.sSpace()}
                </Text>
                <Text
                  ifTrue={
                    state.novel.rating?.has() ??
                    false
                  }
                  invertColor={true}
                  css="desc bold">
                  Rating:
                  {state.novel?.rating?.sSpace()}
                </Text>
                <Text
                  ifTrue={
                    state.novel.status?.has() ??
                    false
                  }
                  invertColor={true}
                  css="desc bold">
                  Status:
                  {state.novel?.status?.sSpace()}
                </Text>
                <Text
                  ifTrue={
                    state.novel.alternativeNames?.has() ??
                    false
                  }
                  invertColor={true}
                  css="desc bold">
                  AlternativeNames:
                  {state.novel?.alternativeNames?.sSpace()}
                </Text>
                <Text
                  ifTrue={
                    state.novel.author?.has() ??
                    false
                  }
                  invertColor={true}
                  css="desc bold">
                  Created By:
                  {state.novel?.author?.sSpace()}
                </Text>
              </View>
            </View>
            <View
              css="box pal:10 par:10 mih:30"
              ifTrue={
                state.novel.genre?.has() ||
                state.novel.tags?.has()
              }
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
                          css="bor:10 flex juc:center mar:5 boc:#c5bebe bow:0.5 pal:8 par:8"
                          key={i}>
                          <Text
                            css="desc bold fos:15"
                            invertColor={true}>
                            #{x}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </ScrollView>
              </View>
              <View
                ifTrue={
                  state.novel.tags?.has() ?? false
                }
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
                            css="desc bold fos:15"
                            invertColor={false}>
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
                css="bold lih:20 pab:10"
                invertColor={true}
                text={state.novel.decription?.cleanHtml()}
              />
              <View css="botw:1 row pat:5 pab:5 botc:gray clearwidth juc:space-between ali:center">
                <Text
                  ifTrue={
                    state.novel.chapters?.has() ??
                    false
                  }
                  invertColor={true}
                  css="header bold fos:15">
                  {state.novel.chapters?.length +
                    " Chapter "}
                  {(state.novel.status || "").has(
                    "Completed"
                  )
                    ? "Completed"
                    : "Updated"}
                </Text>
                <ActionSheetButton
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
                  <View css="clearboth mah:100% juc:flex-start">
                    <View css="juc:flex-start clearboth ali:center he:30 mab:10 mat:10">
                      <TextInput
                        onChangeText={x =>
                          (state.cText = x)
                        }
                        invertColor={false}
                        css="wi:90% pa:5 bor:2"
                        defaultValue={state.cText}
                        placeholder="Search for chapter"
                      />
                    </View>
                    <ItemList
                      css="flex"
                      items={state.novel.chapters?.filter(
                        x =>
                          x.name.has(state.cText)
                      )}
                      container={({ item }) => (
                        <Text
                          css="bold desc"
                          invertColor={true}>
                          {item.name}
                        </Text>
                      )}
                      itemCss="pa:5 clearwidth bobw:1 boc:gray"
                      vMode={true}
                    />
                  </View>
                </ActionSheetButton>
              </View>
            </View>
            <View
              invertColor={true}
              ifTrue={
                state.novel.novelUpdateRecommendations?.has() ??
                false
              }
              css="box he:265 pal:10 par:10 juc:flex-start">
              <Text
                invertColor={true}
                css="header bold pab:5">
                Recommendations
              </Text>
              <ItemList
                itemCss="boc:#ccc bow:1 he:220 wi:170 pa:4 mal:5 bor:5 overflow"
                container={({ item }) => (
                  <View css="clearboth bor:5 overflow">
                    <Image
                      url={item.image}
                      css="resizeMode:contain bor:5 clearwidth wi:100% he:100%"
                    />
                    <View css="clearwidth bottom he:30% overflow">
                      <View css="blur bottom clearboth" />
                      <Text css="clearwidth mih:40% overflow header bold co:#fff pa:4 tea:center">
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
      <View
        css="box row bottom mih:50 juc:center ali:center clearwidth"
        ifTrue={state.novel.url?.has() ?? false}>
        <TouchableOpacity
          css="button mar:5"
          invertColor={true}
          onPress={async () => {
            g.downloadManager().download(
              state.novel.url,
              state.novel.parserName
            );
            g.alert(
              "novel is downloading",
              "attantion"
            ).show();
          }}>
          <View css="blur" />
          <Icon
            type="Feather"
            name="download"
            invertColor={true}
            css="bold"
            size={45}
          />
        </TouchableOpacity>
        <TouchableOpacity
          css="mar:5 button pa:5 wi:65%"
          invertColor={true}
          onPress={() => {
            options
              .nav("ReadChapter")
              .add({
                url: state.novel.url,
                parserName: state.novel.parserName
              })
              .push();
          }}>
          <Text
            invertColor={true}
            css="bold fos:30">
            READ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          css="button"
          invertColor={true}
          onPress={async () => {
            loader.show();
            let book =
              state.book ||
              (await g
                .db()
                .querySelector<Book>("Books")
                .Where.Column(x => x.url)
                .EqualTo(url)
                .AND.Column(x => x.parserName)
                .EqualTo(parserName)
                .findOrSave(
                  Book.n()
                    .Url(state.novel.url)
                    .Name(state.novel.name)
                    .ParserName(parserName)
                    .ImageBase64(
                      await g
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
            css="bold"
            size={45}
            style={{
              color: state.book?.favorit
                ? "red"
                : undefined
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
