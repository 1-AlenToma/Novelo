import { Icon } from "./ReactNativeComponents";
import useLoader from "./Loader";
import ItemList from "./ItemList";
import * as React from "react";
import { useTimer } from "../hooks";
import { View, Text, SafeAreaView } from "./ReactNativeComponents";
export default ({
  book,
  current,
  novel,
  onPress
}: any) => {
  let state = buildState(
    {
      chArray: [] as any[],
      index: { page: 0, index: 0 },
      current: ""
    }).ignore(
      "chArray"
    ).build();
  const loader = useLoader(
    current && current.has(),
    "Loading Chapter"
  );
  let [id, setId] = useState("");
  let timer = useTimer(100);
  let size = 100;
  const [page, setPage] = useState(0);
  if (!state.chArray.has())
    novel.chapters.forEach((x, i) => {
      if (i == 0 || i % size === 0)
        state.chArray.push({
          index: state.chArray.length,
          items: []
        });
      state.chArray.lastOrDefault().items.push(x);
    });

  useEffect(() => {
    timer(() => {
      if (current && current.has()) {
        loader.show();
        for (let item of state.chArray) {
          let i = item.items.findIndex(
            x => x.url == current
          );
          if (i !== -1) {
            state.index = {
              page: item.index,
              index: i
            };
            setPage(item.index);
            break;
          }
        }
        state.current = current;
      }
      setId(methods.newId());
      loader.hide();
    });
  }, [book, novel, current]);



  return (
    <SafeAreaView css="clearboth juc:flex-start mah:90% invert po:relative">
      <View
        ifTrue={() => state.chArray.length > 1}
        css="clearwidth he:50 mat:10">
        <ItemList
          updater={[page]}
          items={state.chArray}
          onPress={item => {
            setPage(item.index);
          }}
          selectedIndex={page}
          container={({ item, index }) => (
            <View
              css={`row di:flex ali:center bor:5 listButton invert ${page == item.index
                ? " selectedRow pal:5 par:5"
                : ""
                }`}>
              <Text
                css="desc fos:15">
                {item.index > 0
                  ? item.index * size + 1 + " - "
                  : "1 - "}
                {((item.index + 1) * size) > novel.chapters.length ? novel.chapters.length : ((item.index + 1) * size)}
              </Text>
              <Icon
                ifTrue={
                  item.index == state.index.page
                }
                color="yellow"
                flash="green"
                css="absolute le:0 to:0"
                size={16}
                type="MaterialIcons"
                name="star"
              />
            </View>
          )}
          itemCss="pa:5 clearwidth bobw:1 boc:gray invert"
          vMode={false}
        />
      </View>
      <View css="clearwidth mih:50 flex invert po-relative">
        <ItemList
          updater={[page, id]}
          onPress={item => {
            loader.show();
            onPress(item);
          }}
          page={state.index.page != page ? 0 : undefined}
          selectedIndex={
            state.index.page == page ? state.index.index : undefined
          }
          items={state.chArray[page].items}
          container={({ item, index }) => (
            <View
              css={`flex mih:40 row juc:space-between di:flex ali:center par:5 bor:1 invert ${current == item.url
                ? "selectedRow"
                : ""
                }`}>
              <Text
                css="desc fos:12 wi:85% tea:left">
                {item.name.safeSplit("/", -1)}
              </Text>
              <View css="row clb">
                <Icon
                  css={
                    book?.chapterSettings?.find(
                      x => x.url == item.url
                    )?.scrollProgress >= 200
                      ? "co-green"
                      : undefined
                  }
                  size={20}
                  type="MaterialIcons"
                  name="preview"
                />
                <Icon
                  css={
                    book?.chapterSettings?.find(
                      x => x.url == item.url
                    )?.isFinished
                      ? "co-green"
                      : undefined
                  }
                  size={20}
                  type="AntDesign"
                  name="checkcircle"
                />
              </View>
            </View>
          )}
          itemCss="pa:5 clearwidth bobw:1 boc:gray invert"
          vMode={true}
        />
      </View>
      {loader.elem}
    </SafeAreaView>
  );
};
