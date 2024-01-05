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
      css="flex pb:70">
      <Header
        {...props}
        titleCss="fs:12"
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
              css="boxS pl:10 pr:10 minHeight:30"
              ifTrue={
                state.novel.genre?.has() ||
                state.novel.tags?.has()
              }
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
              <View
                ifTrue={
                  state.novel.tags?.has() ?? false
                }
                css="h:29 mt:6 clearwidth">
                <ScrollView
                  horizontal={true}
                  contentContainerStyle={{
                    height: 28
                  }}>
                  <View css="row w:100%">
                    {state.novel.tags?.map(
                      (x, i) => (
                        <TouchableOpacity
                          invertColor={false}
                          activeOpacity={1}
                          css="br:10 flex jc:center mr:5 bco:#c5bebe bw:0.5 pl:8 pr:8"
                          key={i}>
                          <Text
                            css="desc bold fs:15"
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
              css="boxS pl:10 pr:10"
              invertColor={true}>
              <FText
                css="bold lh:20 pb:10"
                invertColor={true}
                text={state.novel.decription?.cleanHtml()}
              />
              <View css="btw:1 row pt:5 pb:5 btc:gray clearwidth jc:space-between ai:center">
                <Text
                  ifTrue={
                    state.novel.chapters?.has() ??
                    false
                  }
                  invertColor={true}
                  css="header bold fs:15">
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
                  <View css="clearWidth minHeight:100% h:300 jc:flex-start">
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
                      css="h:80%"
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
                      itemCss="pa:5 clearwidth bbw:1 bco:gray"
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
              css="boxS h:265 pl:10 pr:10 jc:flex-start">
              <Text
                invertColor={true}
                css="header bold pb:5">
                Recommendations
              </Text>
              <ItemList
                itemCss="bco:#ccc bw:1 h:220 w:170 pa:4 ml:5 br:5 overflow"
                container={({ item }) => (
                  <View css="clearBoth br:5 overflow">
                    <Image
                      url={item.image}
                      css="resizeMode:contain br:5 clearwidth w:100% h:100%"
                    />
                    <View css="clearwidth bottom h:30% overflow">
                      <View css="blur bottom clearboth" />
                      <Text css="clearwidth mh:40% overflow header bold-#fff pa:4 ta:center">
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
        css="boxS row bottom minHeight:50 jc:center ai:center clearwidth"
        ifTrue={state.novel.url?.has() ?? false}>
        <TouchableOpacity
          css="button mr:5"
          invertColor={true}>
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
          css="mr:5 button pa:5 w:65%"
          invertColor={true}>
          <Text
            invertColor={true}
            css="bold fs:30">
            READ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          css="button"
          invertColor={true}>
          <View css="blur" />
          <Icon
            type="Fontisto"
            name="favorite"
            invertColor={true}
            css="bold"
            size={45}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
