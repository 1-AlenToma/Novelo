import { FlatList } from "react-native";
import { useRef } from "react";
import { FlashList } from "@shopify/flash-list";
import TouchableOpacity from "./TouchableOpacityView";
import View from "./ThemeView";

export default ({
  items,
  container,
  props,
  itemCss,
  vMode,
  onPress,
  onEndReached,
  scrollIndex,
  nested
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
}) => {
  const onEndReachedCalledDuringMomentum =
    useRef(true);
  const render = item => {
    let d = { item, vMode };
    if (props) d = { ...d, ...props };
    let VR = container;
    return (
      <TouchableOpacity
        css={itemCss}
        onPress={() => onPress?.(item)}>
        <VR {...d} />
      </TouchableOpacity>
    );
  };
  if (!items || !items.has()) return null;
  return (
    <FlashList
      nestedScrollEnabled={nested}
      initialScrollIndex={scrollIndex}
      horizontal={vMode !== true}
      data={items}
      estimatedItemSize={Math.max(
        items.length * 2,
        500
      )}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current =
          false;
      }}
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
