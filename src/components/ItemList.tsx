import {
  memo
} from "react";
import * as React from "react";
import { FlashList } from "@shopify/flash-list";
import { View, AnimatedView, Text, TouchableOpacity, ScrollView } from "react-native-short-style";
import useTimer from "../hooks/Timer";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";


export default function <T>({
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
  page,
  numColumns
}: {
  items: T[];
  container: any;
  onLongPress?: ((item: T) => void);
  props?: any;
  itemCss?: string | ((item: T) => string);
  vMode?: boolean;
  onPress?: (item: T) => void;
  onEndReached?: () => void;
  scrollIndex?: number;
  nested?: boolean;
  updater?: any[];
  hooks?: any[];
  selectedIndex?: number;
  onRefresh?: { loading: boolean, onRefresh: () => void },
  page?: number,
  numColumns?: number;
}) {
  context.hook(
    "selectedThemeIndex",
    ...(hooks ?? [])
  );
  const time = useTimer(100);
  const horizental = useRef(vMode).current;
  const onEndReachedCalledDuringMomentum = useRef(true);
  const ref = useRef();
  const selected = useRef();
  const Render = React.useCallback(({ item, index }: { item: T, index: number }) => {
    let d = { item, vMode: horizental, index };
    if (props) d = { ...d, ...props };
    let VR = container;
    let CN =
      onPress || onLongPress
        ? SingleTouchableOpacity
        : View;
    let cnCSS = typeof itemCss == "string" ? itemCss as string : itemCss?.(item);
    return (
      <CN
        css={cnCSS}
        onLongPress={() => onLongPress?.(item)}
        onPress={e => {
          onPress?.(item);
          e.stopPropagation();
        }}>
        <VR {...d} />
      </CN>
    );
  }, [vMode, itemCss, onPress, onLongPress, container, props]);

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

  const extraData = React.useMemo(() => {
    return [
      ...(updater ?? []),
      selectedIndex,
      context.selectedThemeIndex,
      numColumns
    ]
  }, [updater, selectedIndex, context.selectedThemeIndex, numColumns])


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

  return (
    <View
      style={{
        maxHeight: "100%",
        width: "100%",
        height: "100%",
        flex: 0
      }}
      css="flg:1 mah:100% bac-transparent po-relative">

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
        numColumns={numColumns == 0 ? undefined : numColumns}

        onScrollBeginDrag={() => {
          selected.current = true;
        }}
        nestedScrollEnabled={nested}
        initialScrollIndex={scrollIndex}
        horizontal={horizental !== true}
        data={items ?? []}
        refreshing={onRefresh?.loading}
        onRefresh={onRefresh?.onRefresh}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current =
            false;
        }}

        extraData={extraData}
        onEndReached={() => {
          if (
            !onEndReachedCalledDuringMomentum.current
          ) {
            onEndReached?.();
            onEndReachedCalledDuringMomentum.current =
              true;
          }
        }}
        renderItem={Render}
        keyExtractor={(item, index) => {
          let tm: any = item;
          let key = typeof item == "object" ? tm.name ?? tm.url ?? "" : "";
          if (!key || !key.has())
            key += index;
          return key;
        }}
      />
    </View>
  );
};
