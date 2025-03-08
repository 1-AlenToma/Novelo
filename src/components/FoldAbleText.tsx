import * as React from "react";
import { View, Text, TouchableOpacity } from "./ReactNativeComponents";

let getLines = (text: any, totalLine: number) => {
  if (!text) return text;
  let txt = "";
  let lines = 0;
  for (let s of text) {
    if (s == "\r" || s == "\n") continue;
    txt += s;
    if ((s == "." || s == "!") && txt.length >= 20) lines++;

    if (lines == totalLine)
      break;
  }
  return txt;
};
export default ({
  style,
  text,
  css,
  ifTrue,
  ...props
}: any) => {
  const numberofLines = 3;
  const [fState, setFState] = useState(false);
  const [txt, setTxt] = useState(getLines(text, numberofLines));

  useEffect(() => {
    setTxt(getLines(text, numberofLines));
  }, [text]);
  if (ifTrue === null || ifTrue === false)
    return null;

  return (
    <View
      style={{ flex: 1 }}
      css={"invert"}>
      <Text
        {...props} css={css} style={style}>
        {txt === text || fState === true ? (
          <Text>
            {text}
          </Text>
        ) : (
          <>
            {txt}
            <Text
              css={"co:#bf6416"}
              onPress={() => setFState(true)}>
              {"More".sSpace(2)}
            </Text>
          </>
        )}
      </Text>
    </View>
  );
};
