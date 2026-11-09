import * as React from "react";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { View } from "react-native-short-style/mems";
import useTimer from "../hooks/Timer";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";
import { useNavigation } from '@react-navigation/native';

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
  const swapTimer = useTimer(500);
  const horizental = vMode !== true
  const onEndReachedCalledDuringMomentum = useRef(true);
  const ref = useRef<FlashListRef<T>>();
  const selected = useRef();
  const { locMem, locMemo } = useFunc();
  const navigation = useNavigation();

  const Render = locMem(({ item, index }: { item: T, index: number }) => {
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
  }, vMode, itemCss, onPress, onLongPress, container);

  const scrollTo = locMem(() => {
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
  }, selectedIndex)

  const extraData = locMemo(() => {
    return [
      ...(updater ?? []),
      selectedIndex,
      context.selectedThemeIndex,
      numColumns
    ]
  }, updater, selectedIndex, context.selectedThemeIndex, numColumns)


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
      style={locMem([{
        maxHeight: "100%",
        width: "100%",
        height: "100%",
        flex: 0
      }, style], style)}
      css="flg:1 mah:100% bac-transparent po-relative">

      <FlashList
        ref={locMem(c => {
          ref.current = c as any;
        })}

        onTouchStart={locMem(() => {
          swapTimer.clear();
          if (horizental) navigation.setOptions({ swipeEnabled: false });
        }, navigation, horizental)}

        onTouchEnd={locMem(() => {
          if (horizental) swapTimer(() => navigation.setOptions({ swipeEnabled: true }));
        }, navigation, horizental)}

        onLoad={onload}
        onContentSizeChange={locMem(() => {
          time(() => scrollTo());
        }, scrollTo)}

        contentContainerStyle={locMem({
          padding: 1
        })}
        numColumns={numColumns == 0 ? undefined : numColumns}

        onScrollBeginDrag={locMem(() => {
          selected.current = true;
        })}

        onMomentumScrollEnd={locMem(() => {
          if (horizental)
            swapTimer(() => navigation.setOptions({ swipeEnabled: true }));
        }, navigation, horizental)}


        nestedScrollEnabled={nested}
        initialScrollIndex={scrollIndex}
        horizontal={horizental}
        data={items ?? []}
        refreshing={onRefresh?.loading}
        onRefresh={onRefresh?.onRefresh}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={locMem(() => {
          onEndReachedCalledDuringMomentum.current =
            false;
        })}
        masonry={numColumns > 1}
        extraData={extraData}
        onEndReached={locMem(() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            onEndReached?.();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }, onEndReached)}
        renderItem={Render as any}
        keyExtractor={locMem((item, index) => {
          try {
            let tm: any = item;
            let key = tm && typeof tm == "object" ? tm.url ?? tm.name ?? "" : "";
            if (!key)
              key += String(index);
            return key;
          } catch (e) {
            console.error("key not found")
          }
        })}
      />
    </View>
  );
};
