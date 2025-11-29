import { View, Text, TouchableOpacity } from "react-native-short-style";
import ItemList from "./ItemList";
import useLoader from "./Loader";
import HomeNovelItem from "./HomeNovelItem";
import Header from "../pages/Header";
import {
  memo
} from "react";
import * as React from "react";
import { useParser } from "../hooks";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";
import { LightInfo } from "../native/ParserItems";

export default memo(
  ({
    itemIndex,
    vMode,
    ...props
  }: {
    itemIndex: number;
    vMode?: boolean;
  }) => {
    const loader = useLoader(true);
    const state = buildState({
      items: [] as LightInfo[],
      mounted: false
    }).build()

    const page = useRef(0);
    const item = context.parser.current.settings.group[itemIndex];
    const imageSize = context.parser.current.settings.imagesSize;
    const parser = useParser();

    const getItems = async (refreshing?: boolean) => {
      loader.set(refreshing).show();
      try {
        let p = refreshing ? 1 : page.current + 1;
        let oldItems = [...state.items];
        let gitems = await parser.group(item, p, true, refreshing ? "RenewMemo" : undefined);
        oldItems.distinct("url", gitems as any);
        if (oldItems.length > state.items.length) {
          page.current = p;

          state.items = (oldItems);
        }
      } catch (e) {
        console.error(e);
      } finally {
        loader.hide();
        if (!state.mounted)
          state.mounted = true;
      }
    };

    context.cache.onDirDelete((parserName) => {
      if (!parserName || parserName == context.parser.current.name)
        getItems(true);
    });

    useEffect(() => {
      getItems();
    }, []);

    useEffect(() => {
      if (!state.mounted)
        return;
      console.warn("parser updated")
      page.current = 0;
      getItems();
    }, [parser]);

    if (!item || !item.text)
      return null;

    return (
      <View
        css={
          !vMode
            ? `he-240 mab:10 clearwidth invert`
            : "flex mab:10 root"
        }>
        {loader.elem}
        <View
          css={`pal:5 clearwidth par:5 row juc:space-between invert ${!vMode ? "pal:0 par:0" : ""
            }
          `}>
          {!vMode ? (
            <Text
              css="header he:20 invertco">
              {item.text}
            </Text>
          ) : null}
          {!vMode ? (
            <SingleTouchableOpacity
              css="clb"
              onPress={() => {
                context
                  .nav.navigate("GroupDetail", {
                    groupIndex: itemIndex
                  })
              }}>
              <Text
                css="desc fos:14 invertco">
                Browse
              </Text>
            </SingleTouchableOpacity>
          ) : null}
        </View>
        {vMode ? (
          <Header
            title={item.text}
          />
        ) : null}
        <View css="fl-1 bac-transparent">
          <ItemList
            onRefresh={{ loading: loader.loading && loader.get(), onRefresh: () => getItems(true) }}
            onPress={item => {
              context.nav.navigate("NovelItemDetail", {
                url: item.url,
                parserName: item.parserName
              });
            }}
            vMode={vMode}
            onEndReached={() => {
              if (!loader.loading) {
                loader.show();
                getItems();
              }
            }}
            itemCss={
              !vMode
                ? `boc:#ccc bow:1 he-220 wi:170 mal:5 bor:5 overflow clb`
                : `boc:#ccc bow:1 overflow he-${imageSize ? imageSize.height : "170"} wi:98% mat:5 mal:5 bor:5 clb`
            }
            items={state.items}
            container={({ ...props }: any) => <HomeNovelItem {...props} numberOfLines={imageSize ? 1 : 2} />}
          />
        </View>
      </View>
    );
  }
);
