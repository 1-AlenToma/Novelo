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
  ActionSheetButton,
  ScrollView
} from "../../components/";
import * as React from "react";
import {
  useNavigation,
  useUpdate
} from "../../hooks";
import {
  SearchDetail
} from "../../native";
import Header from "../../pages/Header";

const ActionItem = ({
  keyName,
  selection,
  state
}) => {
  let items = {
    items: state.parser.settings[keyName]
  };
  let selected = {};
  items.items?.map(
    x =>
    (selected[x.text] = state.text[
      keyName
    ].find(f => x.text == f.text)
      ? "selected"
      : "")
  );
  return (
    <View
      ifTrue={items.items?.has() ?? false}
      css="mih:50 pa:10 pat:15 invert">
      <ActionSheetButton
        size="50%"
        title={keyName.displayName()}
        css={"invert"}
        btn={
          <Text
            css={`header co:#bf6416 ${state.text[keyName].has()
              ? "selected"
              : ""
              }`}>
            Search by {keyName}
          </Text>
        }>
        <View css="flex invert">
          <ScrollView horizontal={false}>
            <View css="wi:100% invert">
              {items.items?.map((x, i) => (
                <TouchableOpacity
                  css={`bor:10 he-25 clearwidth flex juc:center mar:5 boc:#c5bebe bobw:0.5 pal:8 par:8`}
                  key={i}
                  onPress={() => {
                    let item = {};
                    item[keyName] = x;
                    selection(item);
                  }}>
                  <Text
                    css={`desc bold fos:15 invertco ${selected[x.text]
                      }`}>
                    {x.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ActionSheetButton>
    </View>
  );
};

export default ({ ...props }: any) => {
  const [{ searchTxt, parserName, genre }, option, navop] = useNavigation(props);
  const parser = parserName?.has() ? context.parser.find(parserName) : context.parser.current;
  const loader = useLoader(
    searchTxt?.has() ?? false
  );
  const state = buildState({
    items: [],
    text: SearchDetail.n(searchTxt || "")
      .Page(0)
      .Genre(
        genre &&
          parser.settings.genre.find(x =>
            x.text.has(genre)
          )
          ? [
            parser.settings.genre.find(x =>
              x.text.has(genre)
            )
          ]
          : []
      ),
    currentPage: 0,
    parser: parser
  }).ignore("parser", "items").build();

  const fetchData = async (page?: number) => {
    loader.show();
    try {
      let parser = state.parser;
      if (parser) {
        let txt = state.text.clone();
        if (page === undefined) txt.page++;
        else txt.page = page;
        let currentItems =
          txt.page > 1 ? [...state.items] : [];
        let items = await parser.search(txt, true);
        if (txt.page <= 1) currentItems = items;
        else {
          currentItems = currentItems.distinct("url", items);
        }

        if (txt.page == 1 || items.length > 0) {
          state.items = currentItems;
          state.text = txt;
        }
      }
    } finally {
      loader.hide();
    }

  };

  useEffect(() => {
    if (
      state.text.text.has() ||
      state.text.genre.has()
    )
      fetchData();
  }, []);

  const selection = async ({
    status,
    genre,
    group
  }: any) => {
    let co =
      state.parser.settings.searchCombination;
    if (!co.has("Group") && !group)
      state.text.group.clear();
    if (!co.has("Status") && !status)
      state.text.status.clear();
    if (!co.has("Genre") && !genre)
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

    if (status) {
      if (
        !state.text.status.find(
          f => f.text == status.text
        )
      ) {
        state.text.status.push(status);
      } else {
        state.text.status =
          state.text.status.filter(
            f => f.text != status.text
          );
      }
    }
    if (genre) {
      if (
        !state.text.genre.find(
          f => f.text == genre.text
        )
      ) {
        if (!parser.settings.genreMultiSelection)
          state.text.genre.clear();
        state.text.genre.push(genre);
      } else {
        state.text.genre =
          state.text.genre.filter(
            f => f.text != genre.text
          );
      }
    }
    if (group) {
      if (
        !state.text.group.find(
          f => f.text == group.text
        )
      ) {
        state.text.group.push(group);
      } else {
        state.text.group =
          state.text.group.filter(
            f => f.text != group.text
          );
      }
    }

    fetchData(1);
  };

  return (
    <View
      css="flex root">
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
        css="row juc:space-between ali:center invert">
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
      <View css="clearwidth mih:50 pab-20 flex invert">
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
          itemCss="boc:#ccc bow:1 overflow he:170 wi:98% mat:5 mal:5 bor:5"
          items={state.items}
          container={HomeNovelItem}
        />
      </View>
    </View>
  );
};
