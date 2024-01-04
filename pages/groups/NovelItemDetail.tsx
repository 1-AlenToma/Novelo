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
  TextInput
} from "../../components/";
import { useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { useNavigation } from "../../hooks";
import { useState } from "../../native";
import g from "../../GlobalContext";
import Header from "../../pages/Header";

export default ({ ...props }: any) => {
  const [{ url, parserName }, options, navop] =
    useNavigation(props);
  const loader = useLoader(true);
  const state = useState({
    novel: {},
    viewChapters: false,
    cText: "",
    infoLoading: false
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
        if (item) state.novel = item;
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
      css="flex">
      <Header
        {...props}
        titleCss="fs:12"
        title={state.novel?.name}
      />
      {loader.elem}
      <View css="flex mt:10">
        <ScrollView>
          <View css="flex ai:center">
            <View
              css="row boxS"
              invertColor={true}>
              <Image
                resizeMethod="scale"
                url={state.novel?.image}
                css="resizeMode:contain h:100% w:150 br:5"
              />
              <View css="flex pa:5">
                <Text
                  css="header flex fg:1 bold fs:18"
                  invertColor={true}>
                  {state.novel.name}
                  <Text
                    css="desc bold c:#775903 clearwidth"
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
              css="boxS pl:10 pr:10"
              invertColor={true}>
              <View css="h:29 clearwidth">
                <ScrollView
                  horizontal={true}
                  contentContainerStyle={{
                    height: 28
                  }}>
                  <View css="row w:100%">
                    {state.novel.genre?.map(
                      (x, i) => (
                        <TouchableOpacity
                          css="br:10 flex jc:center mr:5 bco:#c5bebe bw:0.5 pl:8 pr:8"
                          key={i}>
                          <Text
                            css="desc bold fs:15"
                            invertColor={true}>
                            #{x}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </ScrollView>
              </View>
              <FText
                css="bold lh:20 pb:10"
                invertColor={true}
                text={state.novel.decription?.cleanHtml()}
              />

              <View css="btw:1 row pt:5 pb:5 btc:gray clearwidth jc:space-between ai:center">
                <Text
                  ifTrue={state.novel.chapters?.has() ?? false}
                  invertColor={true}
                  css="header bold fs:15">
                  {(state.novel.chapters?.length  ) +
                    " Chapter "}
                  {(state.novel.status || "").has(
                    "Completed"
                  )
                    ? "Completed"
                    : "Updated"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    (state.viewChapters =
                      !state.viewChapters)
                  }>
                  <Icon
                    invertColor={true}
                    type="AntDesign"
                    name={
                      state.viewChapters
                        ? "caretup"
                        : "caretdown"
                    }
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              {state.viewChapters &&
              state.novel.chapters ? (
                <View css="clearWidth btw:1 btc:gray h:300 jc:flex-start">
                  <View css="jc:flex-start clearboth ai:center h:30 mb:10 mt:10">
                    <TextInput
                      onChangeText={x =>
                        (state.cText = x)
                      }
                      invertColor={false}
                      css="w:90% pa:5 br:2"
                      defaultValue={state.cText}
                      placeholder="Search for chapter"
                    />
                  </View>
                  <ItemList
                    nested={true}
                    items={state.novel.chapters.filter(
                      x => x.name.has(state.cText)
                    )}
                    container={({ item }) => (
                      <Text
                        css="bold desc"
                        invertColor={true}>
                        {item.name}
                      </Text>
                    )}
                    itemCss="pa:5 clearwidth bbw:1 bco:gray"
                    vMode={true}
                  />
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
