import { Icon } from "./ReactNativeComponents";
import useLoader from "./Loader";
import * as React from "react";
import { View, Text, SafeAreaView, VirtualScroller, VirtualScrollerViewRefProps } from "./ReactNativeComponents";
import { Book } from "db";
import { DetailInfo, ChapterInfo } from "native";
export const ChapterView = ({
  book,
  current,
  novel,
  onPress
}: {
  book: Book,
  novel: DetailInfo,
  current: any,
  onPress: ((item: ChapterInfo) => Promise<void>) | ((item: ChapterInfo) => void)
}) => {
  let state = buildState(() =>
  ({
    index: { page: 0, index: 0 },
    pager: { scrollToIndex: undefined } as VirtualScrollerViewRefProps,
    chapterScroll: { scrollToIndex: undefined } as VirtualScrollerViewRefProps,
    currentPage: 0
  })).build();
  const size = 100;
  const loader = useLoader(true, "Loading Chapter");
  const getChapterItems = (chunkIndex: number) => {
    const chapters = novel?.chapters ?? [];
    const start = chunkIndex * size;
    return chapters.slice(start, start + size);
  };


  const chArray = React.useMemo(() => {
    const chapters = novel?.chapters;
    if (!Array.isArray(chapters) || chapters.length === 0) return [];
    const totalChunks = Math.ceil(chapters.length / size);
    return Array.from({ length: totalChunks }, (_, chunkIndex) => ({
      index: chunkIndex,
      items: undefined
    }));
  }, [novel?.chapters?.length]);


  useEffect(() => {
    loader.show();

    const chapters = novel?.chapters ?? [];
    const flatIndex = chapters.findIndex(x => x.url === current);

    if (flatIndex !== -1) {
      const page = Math.floor(flatIndex / size);
      const index = flatIndex % size;

      state.batch(() => {
        state.index = { page, index };
        state.currentPage = page;
      });
    }

    loader.hide();
  }, [current]);



  useEffect(() => {
    if (state.pager.scrollToIndex)
      state.pager.scrollToIndex(state.currentPage, true);
  }, [state.currentPage, state.pager.scrollToIndex])

  useEffect(() => {
    if (state.chapterScroll.scrollToIndex) {
      state.chapterScroll.scrollToIndex(state.index.page == state.currentPage ? state.index.index : 0, true);
    }
  }, [state.currentPage, state.index.index, state.chapterScroll.scrollToIndex])

  const settingsMap = React.useMemo(() => {
    const map = new Map<string, { scrollProgress?: number; isFinished?: boolean }>();
    for (const s of book?.chapterSettings ?? []) map.set(s.url, s);
    return map;
  }, [book?.chapterSettings]);

  if (chArray[state.currentPage] && !chArray[state.currentPage].items && chArray.length > 0)
    chArray[state.currentPage].items = getChapterItems(state.currentPage);

  return (
    <SafeAreaView css="clearboth juc:flex-start mah:98% invert po:relative">
      <View
        ifTrue={chArray.length > 1}
        css="clearwidth he:50 mat:10">
        <VirtualScroller
          updateOn={[state.currentPage]}
          ref={state.pager as any}
          items={chArray}
          itemSize={{ size: 115 }}
          onItemPress={({ item }) => {
            state.currentPage = item.index;
          }}
          renderItem={({ item, index }) => {
            return (
              <View
                css={`row di:flex ali:center bor:5 listButton invert ${state.currentPage === item.index ? " selectedRow pal:5 par:5" : ""}`}>
                <Text
                  css="desc fos:15 wi-100% tea-center">
                  {item.index > 0 ? item.index * size + 1 + " - " : "1 - "}
                  {((item.index + 1) * size) > novel.chapters.length ? novel.chapters.length : ((item.index + 1) * size)}
                </Text>
                <Icon
                  ifTrue={item.index == state.index.page}
                  color="yellow"
                  flash="green"
                  css="absolute le:0 to:0"
                  size={16}
                  type="MaterialIcons"
                  name="star"
                />
              </View>
            )
          }}
          itemStyle={{ padding: 5, width: "100%", borderBottomWidth: 1, borderColor: "gray" }}
          horizontal={true}
        />
      </View>
      <View css="clearwidth mih:50 flex invert po-relative">
        <VirtualScroller
          updateOn={[current]}
          onItemPress={async ({ item }: { item: ChapterInfo }) => {
            if (current != item.url) {
              loader.show();
              await onPress(item);
            }
          }}
          itemSize={{ size: 45 }}
          ref={state.chapterScroll as any}
          items={chArray[state.currentPage]?.items ?? []}
          renderItem={({ item, index }) => (
            <View
              css={`flex mih:40 row juc:space-between di:flex ali:center par:5 bor:1 invert ${current == item.url ? "selectedRow pal-5 par-5" : ""}`}>
              <Text
                css={`desc fos:12 wi:85% tea:left ${current == item.url ? "co-#ffffff" : ""}`}>
                {item.name.safeSplit("/", -1)}
              </Text>
              <View css="row clb">
                <Icon
                  css={settingsMap.get(item.url)?.scrollProgress >= 200 ? "co-green" : undefined}
                  size={20}
                  type="MaterialIcons"
                  name="preview"
                />
                <Icon
                  css={settingsMap.get(item.url)?.isFinished ? "co-green" : undefined}
                  size={20}
                  type="AntDesign"
                  name="checkcircle"
                />
              </View>
            </View>
          )}
          itemStyle={{ padding: 5, width: "100%", borderBottomWidth: 1, borderColor: "gray" }}
        />
      </View>
      {loader.elem}
    </SafeAreaView>
  );
};
