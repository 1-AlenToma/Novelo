import {
  Text,
  View,
  TouchableOpacity
} from "react-native";
import {
  useState,
  useRef,
  useEffect
} from "react";
import {
  removeProps,
  parseThemeStyle
} from "../Methods";
let getFirstLine = (text: any) => {
  if (!text) return text;
  let txt = "";
  for (let s of text) {
    if (s == "\r" || s == "\n") continue;
    txt += s;
    if (s == ".") break;
  }
  return txt;
};
export default ({
  style,
  text,
  invertColor,
  css,
  ifTrue,
  ...props
}: any) => {
  const [fState, setFState] = useState(false);
  const [txt, setTxt] = useState(
    getFirstLine(text)
  );

  useEffect(() => {
    setTxt(getFirstLine(text));
  }, [text]);
  if (ifTrue === null || ifTrue === false)
    return null;
  let st = parseThemeStyle(
    style,
    css,
    invertColor
  );

  return (
    <View
      style={{ flex: 1 }}
      onPress={e => {
        e.preventDefault();
        return true;
      }}>
      <Text
        {...props}
        style={removeProps(
          st,
          "backgroundColor"
        )}>
        {txt === text || fState === true ? (
          <Text onPress={()=> setFState(false)}>
          {text}
          </Text>
        ) : (
          <>
            {txt}
            <Text
              style={"co:#bf6416".css()}
              onPress={() => setFState(true)}>
              {"More".sSpace(2)}
            </Text>
          </>
        )}
      </Text>
    </View>
  );
};
