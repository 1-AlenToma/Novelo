import {
  TabBar,
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image
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
  isVMode
}: {
  item: any;
  isVMode?: boolean;
}) => {
  return (
    <View css="clearBoth">
      <Image
        url={item.image}
        css="absolute resizeMode:cover clearwidth"
      />
      <View css="clearwidth bottom h:50% overflow">
        <View css="blur bottom clearboth" />
        <Text css="clearwidth mh:50% overflow header bold-#fff pa:4 ta:center">
          {item.name}
        </Text>
        <Text css="desc-#fff fs:8 bold clearwidth ta:center">
          {item.decription}
        </Text>
        <Text css="desc-#e30505 clearwidth bold bottom pa:4 ta:center">
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
    <View css="height:220 m:5 mb:10">
      {loader.elem}
      <View css="clearwidth row jc:space-between">
        <Text css="header h:20 bold">
          {item.text}
        </Text>
        <TouchableOpacity>
          <Text css="bold">Browse</Text>
        </TouchableOpacity>
      </View>
      <ItemList
        onEndReached={() => {
          if (!loader.loading) {
            loader.show();
            getItems();
          }
        }}
        itemCss="bco:#ccc bw:1 h:200 w:150 pa:4 ml:5 br:5 overflow"
        items={items}
        container={NovelItemView}
        props={{ vMode: true }}
      />
    </View>
  );
};

const ItemList = ({
  items,
  container,
  props,
  itemCss,
  vMode,
  onPress,
  onEndReached
}: {
  items: any[];
  container: Funtion;
  props?: any;
  itemCss?: string;
  vMode?: boolean;
  onPress?: (item: any) => void;
  onEndReached?: () => void;
}) => {
  const onEndReachedCalledDuringMomentum =
    useRef(true);
  const render = item => {
    let d = { item };
    if (props) d = { ...d, ...props };
    let VR = container;
    return (
      <TouchableOpacity
        css={itemCss}
        onPress={() => onPress?.(item)}>
        <VR {...d} />
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      horizontal={!vMode}
      data={items}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current =
          false;
      }}
      onEndReached={({ distanceFromEnd }) => {
        if (
          !onEndReachedCalledDuringMomentum.current
        ) {
          onEndReached?.();
          onEndReachedCalledDuringMomentum.current =
            true;
        }
      }}
      renderItem={item => render(item.item)}
      keyExtractor={(item, index) => index}
    />
  );
};

export default (props: any) => {
  //return null
  return (
    <View css="flex">
      {g.parser
        .current()
        .settings.group.map((x, i) => (
          <Group
            key={i + g.parser.current().name}
            item={x}
            vMode={true}
          />
        ))}
    </View>
  );
};
