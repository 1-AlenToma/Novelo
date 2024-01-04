import Text from "./ThemeText";
import View from "./ThemeView";
import Image from "./Image";
import Icon from "./Icons";
import { LightInfo } from "../native";

export default ({
  item,
  vMode
}: {
  item: LightInfo;
  vMode?: boolean;
}) => {
  if (!vMode) {
    return (
      <View css="clearBoth br:5 overflow">
        <Image
          url={item.image}
          css=" resizeMode:contain br:5 clearwidth w:100% h:100%"
        />
        <View css="clearwidth bottom h:50% overflow">
          <View css="blur bottom clearboth" />
          <Text css="clearwidth mh:40% overflow header bold-#fff pa:4 ta:center">
            {item.name}
          </Text>
          <View css="row w:100% pl:5 pr:5 d:flex ai:flex-start jc:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
              css="c:#fff"
            />
            <Text css="desc-#fff fs:8 bold ta:center">
              {item.decription}
            </Text>
          </View>

          <Text css="desc-#e30505 clearwidth bold bottom pa:4 ta:center">
            {item.info}
          </Text>
        </View>
      </View>
    );
  } else
    return (
      <View css="clearboth overflow row flex ai:flex-start jc:flex-start">
        <Image
          resizeMethod="scale"
          url={item.image}
          css="resizeMode:contain h:100% w:150 br:5"
        />

        <View css="flex clearboth pl:5">
          <Text css="header bold">
            {item.name}
          </Text>
          <View css="row clearwidth ai:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
            />
            <Text css="desc fs:9 bold">
              {item.decription}
            </Text>
          </View>
          <Text css="desc-#e30505 bottom bold pl:5">
            {item.info}
          </Text>
        </View>
      </View>
    );
};
