import View from "./ThemeView";
import Text from "./ThemeText";
import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
import ItemList from "./ItemList";
import { ScrollView } from "react-native";

export default ({
  items,
  css,
  onPress,
  value
}: any) => {
  return (
    <View
      css={"he:40 juc:flex-end" + (css ?? "")}>
      <ScrollView horizontal={true}>
        <View css="row clearheight ali:center">
          {items.map((x, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                onPress(x);
              }}
              css={`mar:5 juc:center ali:center bor:5 miw:100 pa:10 he:95% ${
                i == value ||
                x.toString().has(value)
                  ? "selectedRow"
                  : ""
              }`}>
              <Text
                invertColor={true}
                css="desc tea:center">
                {x.toString().displayName()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
