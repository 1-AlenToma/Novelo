import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup,
  CheckBox
} from "../components";
import {
  useState,
  useEffect,
  useRef,
  memo
} from "react";
import g from "../GlobalContext";
import Header from "./Header";
import { useNavigation } from "../hooks";

export default ({ ...props }: any) => {
  const [_, options, navop] =
    useNavigation(props);
  g.nav = options;
  let groups = g.parser.current().settings.group;
  return (
    <View css="flex ali:flex-start juc:flex-start">
      {groups.map((x, i) => (
        <NovelGroup
          {...props}
          key={i + g.parser.current().name}
          item={x}
          vMode={false}
        />
      ))}
    </View>
  );
};
