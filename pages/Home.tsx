import {
  TabBar,
  Text,
  View,
  TouchableOpacity,
  useLoader
} from "../components/";
import { FlatList, Image } from "react-native";
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
    <View css="row aCenter jCenter">
      <Image source={item.image} />
      <View css="aLeft">
        <Text css="header bold">{item.name}</Text>
        <Text css="desc">{item.description}</Text>
      </View>
      <Text css="desc-#2828f7">{item.name}</Text>
    </View>
  );
};

const Group = ({
  item,
  vMode
}: {
  item: Value;
  vMode: boolran;
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
        setItems(gitems);
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
    <View css="clearWidth [height:30%]">
      {loader.elem}
      <ItemList
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
  props
}: {
  items: any[];
  container: Funtion;
  props?: any;
}) => {
  const render = item => {
    let d = { item };
    if (props) d = { ...d, ...props };
    console.log(d);
    let VR = container;
    return (
      <TouchableOpacity>
        <VR {...d} />
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      horizontal={true}
      data={items}
      renderItem={item => render(item.item)}
      keyExtractor={(item, index) => index}
    />
  );
};

export default (props: any) => {
  //return null
  return (
    <View css="flex">
      <Group
        item={g.parser
          .current()
          .settings.group.firstOrDefault()}
        vMode={true}
      />
    </View>
  );
};
