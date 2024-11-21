import * as React from "react";
import { View ,Text ,TouchableOpacity} from "./ReactNativeComponents";

let getFirstLine = (text: any) => {
  if (!text) return text;
  let txt = "";
  for (let s of text) {
    if (s == "\r" || s == "\n") continue;
    txt += s;
    if ((s == "." || s == "!") && txt.length >= 20) break;
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

  return (
    <View
      style={{ flex: 1 }}
      onPress={e => {
        e.preventDefault();
        return true;
      }} css={"invert"}>
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
