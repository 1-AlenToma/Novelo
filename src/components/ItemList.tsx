import { FlatList } from "react-native";
import {
  memo
} from "react";
import * as React from "react";
import { FlashList } from "@shopify/flash-list";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "./ReactNativeComponents";
import { useUpdate, useTimer } from "../hooks";
import { newId } from "../Methods";

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
  hooks,
  selectedIndex,
  onRefresh,
  page
}: {
  items: any[];
  container: any;
  onLongPress?: any;
  props?: any;
  itemCss?: string;
  vMode?: boolean;
  onPress?: (item: any) => void;
  onEndReached?: () => void;
  scrollIndex?: number;
  nested?: boolean;
  updater?: any[];
  hooks?: any[];
  selectedIndex?: number;
  onRefresh?: { loading, onRefresh: () => void },
  page?: number
}) => {
  context.hook(
    "selectedThemeIndex",
    ...(hooks ?? [])
  );
  const time = useTimer(100);
  const onEndReachedCalledDuringMomentum =
    useRef(true);
  const ref = useRef();
  const selected = useRef();
  const Render = memo(({ item, index }: any) => {
    let d = { item, vMode, index };
    if (props) d = { ...d, ...props };
    let VR = container;
    let CN =
      onPress || onLongPress
        ? TouchableOpacity
        : View;
    return (
      <CN
        css={itemCss}
        onLongPress={() => onLongPress?.(item)}
        onPress={e => {
          onPress?.(item);
          e.stopPropagation();
        }}>
        <VR {...d} />
      </CN>
    );
  });

  const scrollTo = () => {
    if (
      selectedIndex !== undefined &&
      ref.current &&
      !selected.current
    ) {
      ref.current.scrollToIndex({
        index: selectedIndex,
        animated: false
      });
    }
  };


  useEffect(() => {
    if (page != undefined && page <= 1 && selectedIndex == undefined) {
      ref.current?.scrollToIndex({
        index: 0,
        animated: false
      });
    }
  }, [page, ...(updater ?? [])])

  useEffect(() => {
    selected.current = false;
    scrollTo();
  }, [selectedIndex]);

  if (!items || !items.has()) return null;

  return (
    <View
      style={{
        maxHeight: "100%",
        width: "100%",
        height: "100%",
        flex: 0
      }}
      css="flg:1 mah:100% bac-transparent">
      <FlashList
        ref={c => {
          ref.current = c;
        }}
        onContentSizeChange={() => {
          time(() => scrollTo());
        }}
        contentContainerStyle={{
          padding: 1
        }}
        onScrollBeginDrag={() => {
          selected.current = true;
        }}
        nestedScrollEnabled={nested}
        initialScrollIndex={scrollIndex}
        horizontal={vMode !== true}
        data={items}
        refreshing={onRefresh?.loading}
        onRefresh={onRefresh?.onRefresh}
        estimatedItemSize={200}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current =
            false;
        }}

        extraData={[
          ...(updater ?? []),
          selectedIndex,
          context.selectedThemeIndex
        ]}
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
          <Render item={item} index={index} />
        }
        keyExtractor={(item, index) =>
          index.toString()
        }
      />
    </View>
  );
};
