import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon
} from "../components/";
import { FlatList } from "react-native";
import {
  useState,
  useEffect,
  useRef
} from "react";
import g from "../GlobalContext";
import { Value } from "../native";

const NovelItemView = ({
  item,
  vMode
}: {
  item: any;
  vMode?: boolean;
}) => {
  if (!vMode) {
    return (
      <View css="clearBoth br:5 overflow">
        <Image
          url={item.image}
          css=" resizeMode:contain br:5 clearwidth w:100% h:100%"
        />
        <View css="clearwidth bottom h:50% overflow">
          <View css="blur bottom clearboth" />
          <Text css="clearwidth mh:40% overflow header bold-#fff pa:4 ta:center">
            {item.name}
          </Text>
          <View css="row w:100% pl:5 pr:5 d:flex ai:flex-start jc:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
              color="#fff"
            />
            <Text css="desc-#fff fs:8 bold ta:center">
              {item.decription}
            </Text>
          </View>

          <Text css="desc-#e30505 clearwidth bold bottom pa:4 ta:center">
            {item.info}
          </Text>
        </View>
      </View>
    );
  } else
    return (
      <View css="clearboth row flex ai:flex-start jc:flex-start">
        
          <Image
            resizeMethod="scale"
            url={item.image}
            css="resizeMode:contain h:100% w:150 br:5"
          />
        
        <View css="flex clearboth pl:5">
          <Text css="header bold">
            {item.name}
          </Text>
          <View css="row clearwidth ai:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
            />
            <Text css="desc fs:9 bold">
              {item.decription}
            </Text>
          </View>
          <Text css="desc-#e30505 bottom bold pl:5">
            {item.info}
          </Text>
        </View>
      </View>
    );
};

const Group = ({
  item,
  vMode
}: {
  item: Value;
  vMode?: boolean;
}) => {
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
        <Text css="header h:20 bold">
          {item.text}
        </Text>
        {!vMode ? (
          <TouchableOpacity>
            <Text css="bold">Browse</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ItemList
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
        container={NovelItemView}
      />
    </View>
  );
};

export default (props: any) => {
  //return null
  let groups = g.parser.current().settings.group;
  // test
  groups = [groups[0]];
  return (
    <View css="flex">
      {groups.map((x, i) => (
        <Group
          key={i + g.parser.current().name}
          item={x}
          vMode={true}
        />
      ))}
    </View>
  );
};
