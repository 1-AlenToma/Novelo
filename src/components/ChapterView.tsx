import { Icon, useTimer } from "./ReactNativeComponents";
import useLoader from "./Loader";
import * as React from "react";
import { View, Text, SafeAreaView, VirtualScroller, ProgressBar } from "./ReactNativeComponents";
import { Book, Chapter } from "db";
import { DetailInfo, ChapterInfo } from "native";
export const ChapterView = ({
  book,
  current,
  novel,
  onPress,
  ignoreChapterValidation
}: {
  book: Book,
  novel: DetailInfo,
  current: any,
  onPress: ((item: ChapterInfo) => Promise<void>) | ((item: ChapterInfo) => void),
  ignoreChapterValidation?: boolean
}) => {
  let state = buildState(() =>
  ({
    index: { page: 0, index: 0 },
    currentPage: 0
  })).build();
  const size = 100;
  const loader = useLoader(true, "Loading Chapter");
  const initLoading = useLoader(novel?.chapters.length > 0, "Loading Chapter");
  const initTimer = useTimer(100)
  const getChapterItems = (chunkIndex: number) => {
    const chapters = novel?.chapters ?? [];
    const start = chunkIndex * size;
    return chapters.slice(start, start + size);
  };


  const chArray = React.useMemo(() => {
    const chapters = novel?.chapters;
    if (!Array.isArray(chapters) || chapters.length === 0) return [];
    const totalChunks = Math.ceil(chapters.length / size);
    const data = Array.from({ length: totalChunks }, (_, chunkIndex) => ({
      index: chunkIndex,
      items: undefined
    }));
    return data;
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


  const settingsMap = React.useMemo(() => {
    const map = new Map<string, Chapter>();
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
          initializeIndex={state.currentPage}
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
          itemStyle="pa-5 wi-100% bobw-1 boc-gray invert"
          horizontal={true}
        />
      </View>
      <View css="clearwidth mih:50 flex invert mat-5 po-relative">
        <VirtualScroller
          showsVerticalScrollIndicator={false}
          updateOn={[current]}
          ref={() => {
            initTimer(() => {
              initLoading.hide()
            });
          }}
          onItemPress={async ({ item }: { item: ChapterInfo }) => {
            if (current != item.url || ignoreChapterValidation) {
              loader.show();
              await onPress(item);
            }
          }}
          itemSize={{ size: 45 }}
          initializeIndex={state.index.page == state.currentPage ? state.index.index : 0}
          items={chArray[state.currentPage]?.items ?? []}
          renderItem={({ item, index }) => (
            <View
              css={`pa-5 flex mih:40 row juc:space-between di:flex ali:center bor:1 invert ${current == item.url ? "selectedRow" : ""}`}>
              <Text
                css={`desc fos:12 wi:85% tea:left ${current == item.url ? "co-#ffffff" : ""}`}>
                {item.name.safeSplit("/", -1)}
              </Text>
              <ProgressBar ifTrue={settingsMap.get(item.url)?.readPercent > 0}
                color="#3b5998" value={settingsMap.get(item.url)?.readPercent / 100} css="_abc bo-0 he-5 wi-102%" />
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
          itemStyle="wi-100% bobw-1 boc-gray invert"
        />
      </View>
      {loader.elem ?? initLoading.elem}
    </SafeAreaView>
  );
};
