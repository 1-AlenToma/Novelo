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
  updater,
  selectedIndex
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
  selectedIndex?: number;
}) => {
  const onEndReachedCalledDuringMomentum =
    useRef(true);
  const ref = useRef();
  const render = useCallback((item, index) => {
    let d = { item, vMode, index };
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

  const scrollTo = () => {
    if (
      selectedIndex !== undefined &&
      ref.current
    ) {
      ref.current.scrollToIndex({
        index: selectedIndex,
        animated: false
      });
    }
  };

  useEffect(() => {
    scrollTo();
  }, [selectedIndex]);

  if (!items || !items.has()) return null;

  return (
    <FlashList
      ref={c => {
        ref.current = c;
      }}
      onContentSizeChange={() => {
        scrollTo();
      }}
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
      extraData={[...(updater ?? []), selectedIndex]}
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
        render(item, index)
      }
      keyExtractor={(item, index) =>
        index.toString()
      }
    />
  );
};
