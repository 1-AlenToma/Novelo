import {
  View,
  NovelGroup
} from "../../components/";
import * as React from "react";
import { useNavigation } from "../../hooks";
export default (props: any) => {
  const [{ groupIndex }, _, navigation] =
    useNavigation(props);

  return (
    <View css="flex">
      <NovelGroup
        {...navigation}
        itemIndex={groupIndex}
        vMode={true}
      />
    </View>
  );
};
