import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  ItemList,
  HomeNovelItem,
  ActionSheetButton,
  ScrollView,
  ProgressBar,
  Button,
  Icon
} from "../../components/";
import * as React from "react";
import {
  useNavigation,
  useParserSelector
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
  let items = { items: state.parser.settings[keyName] };
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
  const [{ searchTxt, parserName, genre }] = useNavigation(props);
  const parser = context.parser.find(parserName) ?? context.parser.current;

  const loader = useLoader(
    searchTxt?.has() ?? false
  );
  const state = buildState({
    items: [],
    text: undefined as SearchDetail,
    currentPage: 0,
    parser: parser,
    loadedParser: {},
    procent: {
      parser: "",
      value: 0,
      found: 0,
      stop: false
    }
  }).ignore("parser", "items", "loadedParser").build();
  const globalParser = useParserSelector(() => {
    if (globalParser.hasSelection()) {
      state.text = new SearchDetail(state.text.text ?? "");
      state.items = [];
      state.currentPage = 0;
      if (!state.text.text.empty())
        fetchData(1);
    }
  });

  const fetchData = async (page?: number) => {
    loader.show();
    try {
      let parser = state.parser;
      state.procent.value = 0;
      if (state.text == undefined) {
        parser.settings = await parser.load("RenewMemo");
        state.loadedParser[parser.name] = true;
        state.text = new SearchDetail(searchTxt || "").set("page", 0).set("genre", parser.settings.genre?.filter(x => genre && x.text.has(genre)) ?? []);
      }

      if (state.text.text?.empty() && !state.text.genre?.has() && !state.text.status?.has() && !state.text.group?.has()) {
        state.items = [];
        return;
      }

      const prs = globalParser.hasSelection() ? context.parser.all.filter(x => globalParser.selectedParser.find(f => f.name == x.name && f.selected)) : [parser];
      let txt = state.text.clone();
      if (page === undefined) txt.page++;
      else txt.page = page;
      let currentItems = txt.page > 1 ? [...state.items] : [];

      for (let p of prs) {
        if (state.procent.stop && globalParser.hasSelection())
          break;
        state.procent.parser = p.name;
        if (!state.loadedParser[p.name]) {
          await p.load("RenewMemo");
          state.loadedParser[p.name] = true;
        }

        let items = await p.search(txt);
        state.procent.value = prs.length.procent(prs.indexOf(p) + 1) / 100;
        state.procent.found += items.length;
        if (txt.page <= 1 && !globalParser.hasSelection()) currentItems = items;
        else {
          currentItems = currentItems.distinct("url", items);
        }

      }

      if (txt.page == 1 || currentItems.length > 0) {
        state.items = currentItems;
        state.text = txt;
      }
    } finally {
      loader.hide();
      state.currentPage = state.text.page;
      state.procent.stop = false;
    }

  };

  useEffect(() => {
    if (!state.text || state.text.text.has() || state.text.genre.has())
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

  if (!state.text)
    return loader.elem;

  return (
    <View
      css="flex root">
      <Header
        value={state.text.text}
        inputEnabled={true}
        onInputChange={txt => {
          state.text = SearchDetail.n(txt).Page(0);
          state.items = [];
          if (txt.has())
            fetchData();
        }}
      />
      <View css="invert pal-10 par-10" style={{
        height: globalParser.hasSelection() && loader.loading ? 60 : undefined
      }}>
        {globalParser.elem}
        <ProgressBar ifTrue={loader.loading && globalParser.hasSelection()} value={state.procent.value} css="wi-100% he-30 position-relative" >
          <Text css="_abc le-5 co-red fow-bold wi-100%">Searching {state.procent.parser} Found {state.procent.found} Items</Text>
          <TouchableOpacity css="_abc ri-10 bac-transparent" onPress={() => state.procent.stop = true}>
            <Icon
              name="controller-stop"
              type="Entypo"
              size={35}
              css="co-red"
            />
          </TouchableOpacity>
        </ProgressBar>
      </View>
      <View
        ifTrue={globalParser.hasSelection() == false}
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
      <View css="flex clearwidth mih:50 bac-transparent">
        {loader.elem}
        <View css="clearwidth mih:50 pab-20 flex invert juc-center ali-center" ifTrue={() => state.items.length <= 0}>
          <Text css="fos-18 fow-bold">No Result Found..</Text>
        </View>
        <View css="clearwidth mih:50 pab-20 flex invert" ifTrue={() => state.items.length > 0}>
          <ItemList
            page={state.currentPage}
            onPress={item => {
              context.nav
                .navigate("NovelItemDetail", {
                  url: item.url,
                  parserName: item.parserName
                });
            }}
            vMode={true}
            onEndReached={() => {
              if (!loader.loading) {
                loader.show();
                fetchData();
              }
            }}
            itemCss={(item) => {
              const imageSize = context.parser.find(item.parserName).settings.imagesSize;
              return `boc:#ccc bow:1 overflow he-${imageSize?.height ?? "170"} wi:98% mat:5 mal:5 bor:5`
            }}
            items={state.items}
            container={({ item }) => <HomeNovelItem item={item} vMode={true} showParserName={globalParser.hasSelection()} />}
          />
        </View>
      </View>
    </View>
  );
};
