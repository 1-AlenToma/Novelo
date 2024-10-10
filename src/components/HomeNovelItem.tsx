import Text from "./ThemeText";
import View from "./ThemeView";
import Image from "./Image";
import Icon from "./Icons";
import { LightInfo } from "../native";
import * as React from "react";

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
          resizeMethod="scale"
          url={item.image}
          css="resizeMode:stretch bor:5 clearwidth wi:100% he:100%"
        />
        <Icon
          ifTrue={item.isNew ?? false}
          flash="white"
          css="absolute to:2 ri:2"
          color="red"
          name="fiber-new"
          type="MaterialIcons"
        />
        <View css="clearwidth bottom he:50% overflow">
          <View css="blur bottom clearboth" />
          <Text
            numberOfLines={3}
            css="clearwidth wi:100% header co:#fff pa:4 teA:center">
            {item.name}
          </Text>
          <View ifTrue={()=> item.decription?.length >1} css="row wi:100% pal:5 par:5 di:flex ali:flex-start juc:center">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
              css="co:#fff"
            />
            <Text numberOfLines={1} css="desc co:#fff fos:8 tea:center">
              {item.decription}
            </Text>
          </View>

          <Text numberOfLines={2} css="desc co:#e30505 clearwidth bottom pa:4 tea:center">
            {item.info}
          </Text>
        </View>
      </View>
    );
  } else
    return (
      <View
        invertColor={true}
        css="clearboth di:flex overflow row flex ali:flex-start juc:flex-start">
        <Image
          resizeMethod="scale"
          url={item.image}
          css="resizeMode:stretch he:100% wi:150 bac:red bor:5"
        />
        <Icon
          ifTrue={item.isNew ?? false}
          flash="white"
          css="absolute to:2 le:2"
          color="red"
          name="fiber-new"
          type="MaterialIcons"
        />
        <View css="flex clearboth pa:5">
          <Text
            invertColor={true}
            css="header">
            {item.name}
          </Text>
          <View ifTrue={()=> item.decription?.length >1} css="row clearwidth ali:center">
            <Icon
              invertColor={true}
              type="EvilIcons"
              name="pencil"
              size={15}
            />
            <Text
              invertColor={true}
              css="desc">
              {item.decription}
            </Text>
          </View>
          <Text
            invertColor={true}
            css="desc co:#e30505 bottom bo:5 pal:5">
            {item.info}
          </Text>
        </View>
      </View>
    );
};
