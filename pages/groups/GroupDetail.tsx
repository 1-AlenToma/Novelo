import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup
} from "../../components/";
import {
  useState,
  useEffect,
  useRef
} from "react";
import { useNavigation } from "../../hooks";
import g from "../../GlobalContext";
export default (props: any) => {
  const [{ groupIndex }, _, navigation] =
    useNavigation(props);
  let group =
    g.parser.current().settings.group[groupIndex];
  return (
    <View
      css="flex"
      rootView={true}>
      <NovelGroup
        {...navigation}
        item={group}
        vMode={true}
      />
    </View>
  );
};
