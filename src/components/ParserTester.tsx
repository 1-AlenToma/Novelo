import * as React from "react";
import {
  Text,
  View,
  ScrollView,
  DropdownList,
  Button,
  TextInput,
  Collabse,
} from "react-native-short-style";
import { ChapterDetail, DetailInfo, LightInfo, Parser, ParserDetail, SearchDetail } from "../native/ParserItems";
import useLoader from "./Loader";
import { sleep } from "../Methods";
import ParserWrapper from "../parsers/ParserWrapper";

export default () => {
  const state = buildState({
    GroupItems: [] as { label: string; value: LightInfo[] }[],
    book: undefined as DetailInfo | undefined,
    selectedParser: undefined as ParserWrapper | undefined,
    searchResult: [] as LightInfo[],
    collsbeOpen: { groupItems: true, book: true, searchResult: true, chapter: true, settings: true },
    chapter: undefined as string | ChapterDetail | undefined,
    parserSettings: undefined as ParserDetail | undefined
  }).ignore("selectedParser", "book").build();
  const loader = useLoader(false);

  const loadSettings = async () => {
    state.parserSettings = await state.selectedParser.load("RenewMemo");
  }

  const loadGroups = async () => {
    try {
      loader.show();
      console.log("Loading parser settings for", state.selectedParser?.name);

      console.log("Loaded parser settings, now loading groups...");
      for (const group of state.parserSettings.group) {
        console.log(`Loading group: ${group.text}`);
        const items = await state.selectedParser.group(group, 1, true, "RenewMemo");
        console.log(`Loaded group: ${group.text}, items count: ${items.length}`);
        state.GroupItems.push({ label: group.text, value: items });
      }

      loader.hide();
    } catch (e) {
      console.error(e);
    }
    console.log("Finished loading groups.");
    loader.hide();
  }


  const loadBook = async () => {
    try {
      loader.show();
      const grItem = [...state.GroupItems.map(x => x.value).flatMap(x => x), ...state.searchResult];
      const lNovel = grItem[Math.floor(Math.random() * ((grItem.length - 1) - 0 + 1) + 0)];
      console.log("Loading book details for", lNovel.name);
      state.book = await state.selectedParser.detail(lNovel.url, true, "RenewMemo");
      console.info("book loaded");


    } catch (e) {
      console.error(e);
    }

    loader.hide();
  }

  const loadSearch = async () => {
    try {
      loader.show();
      const search = new SearchDetail("gen")
      console.log("Loading Search details for", search.text);
      state.searchResult = await state.selectedParser.search(search, true)
      console.info("Search loaded");


    } catch (e) {
      console.error(e);
    }

    loader.hide();
  }

  const loadChapter = async () => {
    try {
      loader.show();
      const ch = state.book.chapters[0];
      console.log("Loading chapter details for", ch.name, " with url", ch.url);
      state.chapter = await state.selectedParser.chapter(ch.url);
      console.info("chapter loaded");


    } catch (e) {
      console.error(e);
    }

    loader.hide();
  }


  const getBook = () => {
    let item = { ...state.book };
    item.chapters = [item.chapters[0]]
    return item;
  }

  return (
    <View css="fl-1 invert pa-10">
      <DropdownList
        css="invert"
        placeHolder="Select Parser"
        textInputPlaceHolder="Select Parser"
        render={(item) => <Text css="fos-15 invert">{item.label}</Text>}
        updateOn={[state.selectedParser]}
        selectedValue={state.selectedParser?.name}
        items={context.parser.all.filter(x => x.enabled !== false).map(x => ({ label: x.name, value: x.name }))}
        onSelect={async ({ value }) => {
          loader.show();
          state.batch(async () => {
            state.selectedParser = context.parser.find(value);
            state.GroupItems = [];
            state.book = undefined;
            state.chapter = undefined;
            state.parserSettings = undefined;
            state.searchResult = [];
            state.collsbeOpen = {} as any;
            await loadSettings();
            loader.hide();
          });
        }} />
      <View css="flg-1 mah-60 fld-row juc-center pa-10">
        <Button css="ma-2" text="Test Search" disabled={!state.selectedParser} onPress={loadSearch} />
        <Button css="ma-2" text="Load Groups" disabled={!state.selectedParser} onPress={loadGroups} />
        <Button css="ma-2" text="Test DetailInfo" disabled={!state.GroupItems.has() && !state.searchResult.has()} onPress={loadBook} />
        <Button css="ma-2" text="Test Chapter" disabled={state.book == undefined || !state.book.chapters.has()} onPress={loadChapter} />
      </View>
      <ScrollView css="fl-1">
        <View ifTrue={state.parserSettings != undefined} css="fl-1 pa-5">
          <Collabse css="fl-1 mih-" text="ParserSettings" defaultActive={state.collsbeOpen.settings}
            onActiveStateChange={(open) => state.collsbeOpen.settings = open}>
            <ScrollView style={{ minHeight: 500 }} css="fl-1" nestedScrollEnabled={true}>
              <Text selectable={true} css="fos-12" style={{ fontFamily: 'Courier' }}>
                {[state.parserSettings].niceJson()}
              </Text>
            </ScrollView>
          </Collabse>
        </View>
        <View ifTrue={state.GroupItems.has()} css="fl-1 pa-5">
          <Collabse css="fl-1 mih-" text="Group Items" defaultActive={state.collsbeOpen.groupItems}
            onActiveStateChange={(open) => state.collsbeOpen.groupItems = open}>
            <ScrollView style={{ minHeight: 500 }} css="fl-1" nestedScrollEnabled={true}>
              <Text selectable={true} css="fos-12" style={{ fontFamily: 'Courier' }}>
                {state.GroupItems.niceJson()}
              </Text>
            </ScrollView>
          </Collabse>
        </View>
        <View ifTrue={state.book != undefined} css="fl-1 pa-5">
          <Collabse css="fl-1" text={`${state.book.name} with ${state.book?.chapters.length} chapters`} defaultActive={state.collsbeOpen.book} onActiveStateChange={(open) => state.collsbeOpen.book = open}>
            <ScrollView style={{ minHeight: 500 }} css="fl-1" nestedScrollEnabled={true}>
              <Text selectable={true} css="fos-11" style={{ fontFamily: 'Courier' }}>
                {[getBook()].niceJson()}
              </Text>
            </ScrollView>
          </Collabse>
        </View>
        <View ifTrue={state.searchResult.has()} css="fl-1 pa-5">
          <Collabse css="fl-1" text="SearchResult" defaultActive={state.collsbeOpen.searchResult} onActiveStateChange={(open) => state.collsbeOpen.searchResult = open}>
            <ScrollView style={{ minHeight: 500 }} css="fl-1" nestedScrollEnabled={true}>
              <Text selectable={true} css="fos-11" style={{ fontFamily: 'Courier' }}>
                {state.searchResult.niceJson()}
              </Text>
            </ScrollView>
          </Collabse>
        </View>
        <View ifTrue={state.chapter != undefined} css="fl-1 pa-5">
          <Collabse css="fl-1" text="Chapter" defaultActive={state.collsbeOpen.chapter} onActiveStateChange={(open) => state.collsbeOpen.chapter = open}>
            <ScrollView style={{ minHeight: 500 }} css="fl-1" nestedScrollEnabled={true}>
              <Text selectable={true} css="fos-11" style={{ fontFamily: 'Courier' }}>
                {[state.chapter].niceJson()}
              </Text>
            </ScrollView>
          </Collabse>
        </View>
      </ScrollView>
      {loader.elem}
    </View>
  );
};
