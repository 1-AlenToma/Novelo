import View from "./ThemeView";
import TextInput from "./TextInputView";
import Text from "./ThemeText";
import Icon from "./Icons";
import ItemList from "./ItemList";
import { useState } from "../native";
import { ScrollView } from "react-native";
import {
  useState as uss,
  useEffect
} from "react";
import { useUpdate } from "../hooks";
import TouchableOpacity from "./TouchableOpacityView";
export default ({
  book,
  current,
  novel,
  onPress
}: any) => {
  let state = useState(
    {
      chArray: [] as any[],
      index: 0,
      current: ""
    },
    "chArray"
  );
  let [id, setId] = useState();
  let size = 100;
  const [page, setPage] = uss(0);
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
    if (current && current.has()) {
      for (let item of state.chArray) {
        let i = item.items.findIndex(
          x => x.url == current
        );
        if (i !== -1) {
          state.index = item.index;
          setPage(item.index);
          break;
        }
      }
      state.current = current;
    }
    setId(methods.newId());
  }, [book, novel, current]);

  return (
    <View css="clearboth juc:flex-start mah:90%">
      <View
        ifTrue={() => state.chArray.length > 1}
        css="clearwidth he:50 mat:10">
        <ItemList
          css="flex"
          updater={[page]}
          items={state.chArray}
          onPress={item => {
            setPage(item.index);
          }}
          selectedIndex={page}
          container={({ item, index }) => (
            <View
              css={`row di:flex ali:center bor:5 listButton ${
                page == item.index
                  ? " selectedRow pal:5 par:5"
                  : ""
              }`}>
              <Text
                invertColor={true}
                css="desc fos:15">
                {item.index > 0
                  ? item.index * size + 1 + " - "
                  : "1 - "}
                {(item.index + 1) * size}
              </Text>
              <Icon
                ifTrue={item.index == state.index}
                color="yellow"
                flash="green"
                css="absolute le:0 to:0"
                size={16}
                type="MaterialIcons"
                name="star"
              />
            </View>
          )}
          itemCss="pa:5  clearwidth bobw:1 boc:gray"
          vMode={false}
        />
      </View>
      <View css="clearwidth mih:50 flex">
        <ItemList
          css="flex"
          updater={[page, id]}
          onPress={item => {
            onPress(item);
          }}
          selectedIndex={state.index}
          items={state.chArray[page].items}
          container={({ item, index }) => (
            <View
              css={`flex mih:20 row juc:space-between di:flex ali:center pal:5 par:5 bor:2 ${
                current == item.url
                  ? "selectedRow"
                  : ""
              }`}>
              <Text
                css="desc maw:90%"
                invertColor={true}>
                {item.name.safeSplit("/", -1)}
              </Text>
              <View css="row">
                <Icon
                  invertColor={true}
                  color={
                    book?.chapterSettings?.find(
                      x => x.url == item.url
                    )?.scrollProgress >= 200
                      ? "green"
                      : undefined
                  }
                  size={16}
                  type="MaterialIcons"
                  name="preview"
                />
                <Icon
                  invertColor={true}
                  color={
                    book?.chapterSettings?.find(
                      x => x.url == item.url
                    )?.isFinished
                      ? "green"
                      : undefined
                  }
                  size={16}
                  type="AntDesign"
                  name="checkcircle"
                />
              </View>
            </View>
          )}
          itemCss="pa:5 clearwidth bobw:1 boc:gray"
          vMode={true}
        />
      </View>
    </View>
  );
};
