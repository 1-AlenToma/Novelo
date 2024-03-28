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
export default (props: any) => {
  const [{ groupIndex }, _, navigation] =
    useNavigation(props);
  let group =
    context.parser.current().settings.group[groupIndex];
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
