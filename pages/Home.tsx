import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup
} from "../components";
import {
  useState,
  useEffect,
  useRef,
  memo
} from "react";
import g from "../GlobalContext";
import Header from "./Header";

export default ({ ...props }: any) => {
  let groups = g.parser.current().settings.group;
  return (
  
      
      <View css="flex ai:flex-start jc:flex-start">
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
