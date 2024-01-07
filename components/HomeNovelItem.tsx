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
      <View css="clearboth bor:5 overflow">
        <Image
          url={item.image}
          css="resizeMode:contain bor:5 clearwidth wi:100% he:100%"
        />
        <View css="clearwidth bottom he:50% overflow">
          <View css="blur bottom clearboth" />
          <Text css="clearwidth mih:40% wi:100% header bold co:#fff pa:4 teA:center">
            {item.name}
          </Text>
          <View css="row wi:100% pal:5 par:5 di:flex ali:flex-start juc:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
              css="co:#fff"
            />
            <Text css="desc co:#fff fos:8 bold tea:center">
              {item.decription}
            </Text>
          </View>

          <Text css="desc co:#e30505 clearwidth bold bottom pa:4 tea:center">
            {item.info}
          </Text>
        </View>
      </View>
    );
  } else
    return (
      <View css="clearboth overflow row flex ali:flex-start juc:flex-start">
        <Image
          resizeMethod="scale"
          url={item.image}
          css="resizeMode:contain he:100% wi:150 bor:5"
        />

        <View css="flex clearboth pal:5">
          <Text css="header bold">
            {item.name}
          </Text>
          <View css="row clearwidth ali:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
            />
            <Text css="desc fos:9 bold">
              {item.decription}
            </Text>
          </View>
          <Text css="desc co:#e30505 bottom bold pal:5">
            {item.info}
          </Text>
        </View>
      </View>
    );
};
