import * as React from "react";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { View } from "react-native-short-style/mems";
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
  numColumns,
  onload,
  style
}: {
  onload?: () => void,
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
  style?: any
}) {
  context.hook(
    "selectedThemeIndex",
    ...(hooks ?? [])
  );
  const time = useTimer(100);
  const horizental = useRef(vMode).current;
  const onEndReachedCalledDuringMomentum = useRef(true);
  const ref = useRef<FlashListRef<T>>();
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
      style={React.useMemo(() => [{
        maxHeight: "100%",
        width: "100%",
        height: "100%",
        flex: 0
      }, style], [style])}
      css="flg:1 mah:100% bac-transparent po-relative">

      <FlashList
        ref={c => {
          ref.current = c;
        }}

        onLoad={onload}

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
          if (!onEndReachedCalledDuringMomentum.current) {
            onEndReached?.();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        renderItem={Render}
        keyExtractor={(item, index) => {
          let tm: any = item;
          let key = tm && typeof tm == "object" ? tm.url ?? tm.name ?? "" : "";
          if (!key)
            key += String(index);
          return key;
        }}
      />
    </View>
  );
};
