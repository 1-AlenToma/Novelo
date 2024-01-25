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
import {
  useNavigation,
  useUpdate
} from "../../hooks";
import {
  useState,
  SearchDetail
} from "../../native";
import g from "../../GlobalContext";
import Header from "../../pages/Header";

const ActionItem = ({
  keyName,
  selection,
  state
}) => {
  let items = state.parser.settings[keyName];

  return (
    <View
      ifTrue={items?.has() ?? false}
      invertColor={true}
      css="mih:50 pa:10 pat:15">
      <ActionSheetButton
        height="30%"
        title="Status"
        btn={
          <Text
            invertColor={true}
            css={`header co:#bf6416 ${
              state.text[keyName].has()
                ? "selected"
                : ""
            }`}>
            Search by {keyName}
          </Text>
        }>
        <ScrollView horizontal={false}>
          <View css="wi:100%">
            {items?.map((x, i) => (
              <TouchableOpacity
                css={`bor:10 hi:25 clearwidth flex juc:center mar:5 boc:#c5bebe bobw:0.5 pal:8 par:8`}
                key={i}
                onPress={() => {
                  let item = {};
                  item[keyName] = x;
                  selection(item);
                }}>
                <Text
                  css={`desc bold fos:15 ${
                    state.text[keyName].find(
                      f => x.text == f.text
                    )
                      ? "selected"
                      : ""
                  }`}
                  invertColor={true}>
                  {x.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ActionSheetButton>
    </View>
  );
};

export default ({ ...props }: any) => {
  const update = useUpdate();
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

  const fetchData = async (page?: number) => {
    loader.show();
    let parser = state.parser;
    if (parser) {
      let txt = state.text.clone();
      if (page === undefined) txt.page++;
      else txt.page = page;
      let currentItems =
        txt.page > 1 ? [...state.items] : [];
      let items = await parser.search(txt);
      if (txt.page <= 1) currentItems = items;
      else {
        currentItems = currentItems.distinct(
          "url",
          items
        );
      }

      if (txt.page == 1 || items.length > 0) {
        state.items = currentItems;
        state.text = txt;
      }
    }
    loader.hide();
  };

  useEffect(() => {
    if (state.text.text.has()) fetchData();
  }, []);

  const selection = async ({
    status,
    genre,
    group
  }: any) => {
    let co =
      state.parser.settings.searchCombination;
    if (!co.has("Group"))
      state.text.group.clear();
    if (!co.has("Status"))
      state.text.status.clear();
    if (!co.has("Genre"))
      state.text.genre.clear();

    if (group && !co.has("Group")) {
      state.text.status.clear();
      state.text.genre.clear();
    }

    if (status && !co.has("Status")) {
      state.text.group.clear();
      state.text.genre.clear();
    }

    if (genre && !co.has("Genre")) {
      state.text.group.clear();
      state.text.status.clear();
    }

    if (status) state.text.status.push(status);
    if (genre) state.text.genre.push(genre);
    if (group) state.text.group.push(group);
    fetchData(1);
  };

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
          state.text =
            SearchDetail.n(txt).Page(0);
          if (txt === "") state.items = [];
          else fetchData();
        }}
      />

      <View
        invertColor={true}
        css="row juc:space-between ali:center">
        <ActionItem
          state={state}
          selection={item => selection(item)}
          keyName="status"
        />

        <ActionItem
          state={state}
          selection={item => selection(item)}
          keyName="group"
        />

        <ActionItem
          state={state}
          selection={item => selection(item)}
          keyName="genre"
        />
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
