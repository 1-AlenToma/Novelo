import { View, Text, Icon } from "./ReactNativeComponents";
import Image from "./Image";
import { LightInfo } from "../native";
import * as React from "react";

export default ({
  item,
  vMode,
  showParserName
}: {
  item: LightInfo;
  vMode?: boolean;
  showParserName?: boolean
}) => {

  if (!vMode) {
    return (
      <View css="clearboth bor:5 overflow invert">
        <Image
          parserName={item.parserName}
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

        <Text css="absolute le-2 to-2 pa-2 bor-5 bac-#ffa000 co-white" ifTrue={item.langType?.has() ?? false}>{item.langType}</Text>
        <View css="clearwidth bottom he:50% overflow invert">
          <View css="blur bottom clearboth" />
          <Text
            numberOfLines={1}
            css="clearwidth wi:99% header co:#fff pal-5 par-5 pat-5 tea:center">
            {item.name}
          </Text>
          <View ifTrue={() => item.decription?.length > 1}
            css="row wi:100% pal:5 par:5 di:flex ali-center juc:center clb">
            <Icon
              type="EvilIcons"
              name="pencil"
              size={15}
              css="co-#FFFFFF"
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
        css="invert clearboth di:flex overflow row flex ali:flex-start juc:flex-start">

        <View css="juc-center ali-center he-100%">
          <Image
            parserName={item.parserName}
            url={item.image}
            css="resizeMode:stretch he:100% wi:150 bac:red bor:5"
          />
        </View>
        <Icon
          ifTrue={item.isNew ?? false}
          flash="white"
          css="absolute to:2 le:2"
          color="red"
          name="fiber-new"
          type="MaterialIcons"
        />

        <Text css="absolute le-2 to-2 pa-2 bor-5 bac-#ffa000 co-white" ifTrue={item.langType?.has() ?? false}>{item.langType}</Text>
        <View css="flex clearboth pa:5 invert">
          <Text
            css="header" numberOfLines={1}>
            {item.name}
          </Text>
          <View ifTrue={() => item.decription?.length > 1} css="row clearwidth ali-center invert">
            <Icon
              type="EvilIcons"
              name="pencil"
              css="invertco"
              size={15}
            />
            <Text
              css="desc" numberOfLines={1}>
              {item.decription}
            </Text>
          </View>
          <View css="invert bottom bo-5 pal-5">
            <Text
              ifTrue={showParserName == true}
              css="desc fow-bold" numberOfLines={1}>
              Parser:{item.parserName}
            </Text>
            <Text
              css="desc co:#e30505" numberOfLines={1}>
              {item.info}
            </Text>
          </View>
        </View>
      </View>
    );
};
