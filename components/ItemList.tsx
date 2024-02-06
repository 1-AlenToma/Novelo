import { FlatList } from "react-native";
import {
  useRef,
  useEffect,
  useCallback
} from "react";
import { FlashList } from "@shopify/flash-list";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";
import { useUpdate } from "../hooks";

export default ({
  items,
  container,
  props,
  itemCss,
  vMode,
  onPress,
  onLongPress,
  onEndReached,
  scrollIndex,
  nested,
  updater
}: {
  items: any[];
  container: Funtion;
  props?: any;
  itemCss?: string;
  vMode?: boolean;
  onPress?: (item: any) => void;
  onEndReached?: () => void;
  scrollIndex?: number;
  nested?: boolean;
  updater?: any[];
}) => {
  const onEndReachedCalledDuringMomentum =
    useRef(true);
  const render = useCallback(item => {
    let d = { item, vMode };
    if (props) d = { ...d, ...props };
    let VR = container;
    return (
      <TouchableOpacity
        css={itemCss}
        onLongPress={() => onLongPress?.(item)}
        onPress={() => onPress?.(item)}>
        <VR {...d} />
      </TouchableOpacity>
    );
  });

  if (!items || !items.has()) return null;

  return (
    <FlashList
      contentContainerStyle={{
        padding: 1
      }}
      nestedScrollEnabled={nested}
      initialScrollIndex={scrollIndex}
      horizontal={vMode !== true}
      data={items}
      estimatedItemSize={200}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current =
          false;
      }}
      extraData={updater}
      onEndReached={() => {
        if (
          !onEndReachedCalledDuringMomentum.current
        ) {
          onEndReached?.();
          onEndReachedCalledDuringMomentum.current =
            true;
        }
      }}
      renderItem={({ item, index }) =>
        render(item)
      }
      keyExtractor={(item, index) =>
        index.toString()
      }
    />
  );
};