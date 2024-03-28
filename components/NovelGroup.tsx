import Text from "./ThemeText";
import View from "./ThemeView";
import { Value } from "../native";
import ItemList from "./ItemList";
import useLoader from "./Loader";
import TouchableOpacity from "./TouchableOpacityView";
import HomeNovelItem from "./HomeNovelItem";
import { useNavigation } from "../hooks";
import { Header } from "../pages";
import {
  useState,
  useRef,
  useEffect,
  memo
} from "react";

export default memo(
  ({
    item,
    vMode,
    ...props
  }: {
    item: Value;
    vMode?: boolean;
  }) => {
    const [params, option, navs] =
      useNavigation(props);
    const loader = useLoader(true);
    const [items, setItems] = useState([]);
    const page = useRef(0);
    const getItems = async () => {
      loader.show();
      try {
        let parser = context.parser.current();
        let p = page.current + 1;
        let oldItems = [...items];
        let gitems = await parser.group(
          item,
          p,
          true
        );
        oldItems.distinct("url", gitems);
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

    useEffect(() => {
      getItems();
    }, []);

    return (
      <View
        css={
          !vMode
            ? "he:240 mab:10 clearwidth"
            : "flex mab:10"
        }>
        {loader.elem}
        <View
          css={`pal:5 clearwidth par:5 row juc:space-between ${!vMode ? "pal:0 par:0" : ""}
          `}>
          {!vMode ? (
            <Text
              invertColor={true}
              css="header he:20">
              {item.text}
            </Text>
          ) : null}
          {!vMode ? (
            <TouchableOpacity
              onPress={() => {
                option
                  .nav("GroupDetail")
                  .add({
                    groupIndex: context.parser
                      .current()
                      .settings.group.findIndex(
                        x => x === item
                      )
                  })
                  .push();
              }}>
              <Text
                invertColor={true}
                css="desc fos:14">
                Browse
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {vMode ? (
          <Header
            {...navs}
            title={item.text}
          />
        ) : null}
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
          vMode={vMode}
          onEndReached={() => {
            if (!loader.loading) {
              loader.show();
              getItems();
            }
          }}
          itemCss={
            !vMode
              ? "boc:#ccc bow:1 he:220 wi:170 mal:5 bor:5 overflow"
              : "boc:#ccc bow:1 overflow he:170 wi:98% mat:5 mal:5 bor:5"
          }
          items={items}
          container={HomeNovelItem}
        />
      </View>
    );
  }
);
