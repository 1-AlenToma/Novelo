import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup,
  HomeNovelItem,
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
import {
  useState,
  SearchDetail
} from "../../native";
import g from "../../GlobalContext";
import Header from "../../pages/Header";

export default ({ ...props }: any) => {
  const [
    { searchTxt, parserName },
    option,
    navop
  ] = useNavigation(props);
  const loader = useLoader(
    searchTxt?.has() ?? false
  );
  const state = useState({
    items: [],
    text: SearchDetail.n(searchTxt || "").Page(0),
    currentPage: 0,
    parser: parserName?.has()
      ? g.parser.find(parserName)
      : g.parser.current()
  });

  const fetchData = async () => {
    loader.show();
    let parser = state.parser;
    if (parser) {
      let txt = state.text.clone();
      txt.page++;
      let currentItems =
        txt.page > 1 ? [...state.items] : [];
      let items = await parser.search(txt);
      if (txt.page <= 1) currentItems = items;
      else {
        currentItems =
          currentItems.distinct(items);
      }

      if (
        txt.page == 1 ||
        currentItems.length != state.items.length
      ) {
        state.text.Page(txt.page);
        state.items = currentItems;
      }
    }

    loader.hide();
  };

  useEffect(() => {
    if (state.text.text.has()) fetchData();
  }, []);

  return (
    <View
      css="flex"
      rootView={true}>
      {loader.elem}
      <Header
        {...navop}
        value={state.text.text}
        inputEnabled={true}
        onInputChange={txt => {
          state.text.Text(txt).Page(0);
          if (txt === "") state.items = [];
          else fetchData();
        }}
      />
      <View
        invertColor={true}
        css="row juc:space-between ali:center">
        <View
          ifTrue={
            state.parser.settings.status?.has() ??
            false
          }
          invertColor={true}
          css="mih:50 pa:10 pat:15">
          <ActionSheetButton
            height="30%"
            title="Status"
            btn={
              <Text
                invertColor={true}
                css="header co:#bf6416">
                Search by status
              </Text>
            }>
            <ScrollView horizontal={false}>
              <View css="wi:100%">
                {state.parser.settings.status?.map(
                  (x, i) => (
                    <TouchableOpacity
                      css="bor:10 hi:25 clearwidth flex juc:center mar:5 boc:#c5bebe bobw:0.5 pal:8 par:8"
                      key={i}>
                      <Text
                        css="desc bold fos:15"
                        invertColor={true}>
                        {x.text}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </ScrollView>
          </ActionSheetButton>
        </View>
        <View
          ifTrue={
            state.parser.settings.group?.has() ??
            false
          }
          invertColor={true}
          css="mih:50 pa:10 pat:15">
          <ActionSheetButton
            height="30%"
            title="Section"
            btn={
              <Text
                invertColor={true}
                css="header co:#bf6416">
                Search by section
              </Text>
            }>
            <ScrollView horizontal={false}>
              <View css="wi:100%">
                {state.parser.settings.group?.map(
                  (x, i) => (
                    <TouchableOpacity
                      css="bor:10 hi:25 clearwidth flex juc:center mar:5 boc:#c5bebe bobw:0.5 pal:8 par:8"
                      key={i}>
                      <Text
                        css="desc bold fos:15"
                        invertColor={true}>
                        {x.text}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </ScrollView>
          </ActionSheetButton>
        </View>
        <View
          ifTrue={
            state.parser.settings.genre?.has() ??
            false
          }
          invertColor={true}
          css="mih:50 pa:10 pat:15">
          <ActionSheetButton
            height="80%"
            title="Genres"
            btn={
              <Text
                invertColor={true}
                css="header co:#bf6416">
                Search by genre
              </Text>
            }>
            <ScrollView horizontal={false}>
              <View css="wi:100%">
                {state.parser.settings.genre?.map(
                  (x, i) => (
                    <TouchableOpacity
                      css="bor:10 hi:25 clearwidth flex juc:center mar:5 boc:#c5bebe bobw:0.5 pal:8 par:8"
                      key={i}>
                      <Text
                        css="desc bold fos:15"
                        invertColor={true}>
                        {x.text}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </ScrollView>
          </ActionSheetButton>
        </View>
      </View>
      <ItemList
        onPress={item => {
          option
            .nav("NovelItemDetail")
            .add({
              url: item.url,
              parserName: item.parserName
            })
            .push();
        }}
        vMode={true}
        onEndReached={() => {
          if (!loader.loading) {
            loader.show();
            fetchData();
          }
        }}
        itemCss="boc:#ccc bow:1 he:170 wi:98% mat:5 pa:4 mal:5 bor:5"
        items={state.items}
        container={HomeNovelItem}
      />
    </View>
  );
};
