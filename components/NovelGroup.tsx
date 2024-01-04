import Text from "./ThemeText";
import View from "./ThemeView";
import { Value } from "../native";
import ItemList from "./ItemList";
import useLoader from "./Loader";
import TouchableOpacity from "./TouchableOpacityView";
import HomeNovelItem from "./HomeNovelItem";
import g from "../GlobalContext";
import { useNavigation } from "../hooks";
import {Header} from "../pages";
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
        let parser = g.parser.current();
        let p = page.current + 1;
        let oldItems = [...items];
        let gitems = await parser.group(item, p);
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
            ? "h:240 mb:10 clearwidth"
            : "flex mb:10 mt:10"
        }>
        {loader.elem}
        <View css="pl:5 clearwidth pr:5 row jc:space-between">
          {!vMode ? (
            <Text css="header h:20 bold">
              {item.text}
            </Text>
          ) : null}
          {!vMode ? (
            <TouchableOpacity
              onPress={() => {
                option
                  .nav("GroupDetail")
                  .add({
                    groupIndex: g.parser
                      .current()
                      .settings.group.findIndex(
                        x => x === item
                      )
                  })
                  .push();
              }}>
              <Text css="bold">Browse</Text>
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
          onPress={(item)=> {
            option.nav("NovelItemDetail").add({
              url:item.url,
              parserName:item.parserName
            }).push()
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
              ? "bco:#ccc bw:1 h:220 w:170 pa:4 ml:5 br:5 overflow"
              : "bco:#ccc bw:1 h:170 w:98% mt:5 pa:4 ml:5 br:5"
          }
          items={items}
          container={HomeNovelItem}
        />
      </View>
    );
  }
);
