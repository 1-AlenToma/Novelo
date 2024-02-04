import View from "./ThemeView";
import Text from "./ThemeText";
import Icon from "./Icons";
import TouchableOpacity from "./TouchableOpacityView";
export default ({
  checked,
  text,
  onChange,
  css,
  ...props
}) => {
  let ico = (
    <Icon
      type="MaterialIcons"
      name={
        checked
          ? "radio-button-checked"
          : "radio-button-unchecked"
      }
      size={20}
      {...props}
    />
  );
  return (
    <View css={`row clearwidth ${css ?? ""}`}>
    {onChange ?(<TouchableOpacity onPress={onChange}>
        {ico}
      </TouchableOpacity>): ico}

      <Text
        ifTrue={text != undefined}
        {...props}
        css="fos:14 mal:2 bold">
        {text}
      </Text>
    </View>
  );
};
