import { View, Text, TouchableOpacity } from "react-native-short-style";
import ItemList from "./ItemList";
import useLoader from "./Loader";
import HomeNovelItem from "./HomeNovelItem";
import Header from "../pages/Header";
import {
  memo
} from "react";
import * as React from "react";

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
    const [items, setItems] = useState([]);
    const page = useRef(0);
    const item = context.parser.current.settings.group[itemIndex];
    const imageSize = context.parser.current.settings.imagesSize;

    const getItems = async (refreshing?: boolean) => {
      loader.show();
      try {
        let parser = context.parser.current;
        let p = refreshing ? 1 : page.current + 1;
        let oldItems = [...items];
        let gitems = await parser.group(item, p, true, refreshing ? "RenewMemo" : undefined);
        oldItems.distinct("url", gitems as any);
        if (oldItems.length > items.length) {
          page.current = p;
          setItems(oldItems);
        }
      } catch (e) {
        console.error(e);
      } finally {
        loader.hide();
      }
    };

    context.cache.onDirDelete((parserName) => {
      if (!parserName || parserName == context.parser.current.name)
        getItems(true);
    });

    useEffect(() => {
      getItems();
    }, []);

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
            <TouchableOpacity
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
            </TouchableOpacity>
          ) : null}
        </View>
        {vMode ? (
          <Header
            title={item.text}
          />
        ) : null}
          <ItemList
            onRefresh={{ loading: loader.loading, onRefresh: () => getItems(true) }}
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
            items={items}
            container={HomeNovelItem}
          />
        </View>
    );
  }
);
