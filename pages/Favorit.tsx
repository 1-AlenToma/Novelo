import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup,
  CheckBox,
  TextInput
} from "../components";
import { useEffect, useRef, memo } from "react";
import g from "../GlobalContext";
import Header from "./Header";
import { Buffer } from "buffer";
import {
  useNavigation,
  useUpdate,
  useDbHook
} from "../hooks";
import * as DocumentPicker from "expo-document-picker";
import { Book, Chapter } from "../db";
import {
  useState,
  FileHandler,
  ZipBook
} from "../native";
import { sleep } from "../Methods";

export default ({ ...props }: any) => {
  const [_, options, navop] =
    useNavigation(props);
  const updater = useUpdate();
  const loader = useLoader();
  const state = useState({
    text: "",
    json: "",
    infoNovel: {}
  });
  const [books, dataIsLoading] = g.db().useQuery(
    "Books",
    g
      .db()
      .querySelector<Book>("Books")
      .LoadChildren<Chapter>(
        "Chapters",
        "parent_Id",
        "id",
        "chapterSettings",
        true
      )
      .Where.Column(x => x.favorit)
      .EqualTo(true)
      .AND.Column(x => x.parserName)
      .NotEqualTo("epub")
  );

  useEffect(() => {
    (async () => {
      for (let b of books) {
        if (!state.infoNovel[b.url]) {
          if (b.parserName !== "epub") {
            let novel = await g.parser
              .find(b.parserName)
              .detail(b.url);
            if (novel) {
              state.infoNovel[
                b.url
              ] = `(${b.chapterSettings.length}/${novel.chapters.length})`;
              updater();
            }
          }
          await sleep(500);
        }
      }
    })();
  }, [books]);

  return (
    <View css="flex mih:100">
      {loader.elem}
      <View css="juc:flex-start clearboth ali:center he:30 mab:10 mat:10">
        <TextInput
          onChangeText={x => (state.text = x)}
          invertColor={true}
          css="wi:90% pa:5 bor:2"
          defaultValue={state.text}
          placeholder="Search..."
        />
      </View>
      <ItemList
        css="flex"
        items={books?.filter(x =>
          x.name.has(state.text)
        )}
        container={({ item }) => (
          <View
            invertColor={true}
            css="clearboth pal:5 par:5 he:60 row di:flex juc:flex-start">
            <Image
              url={item.imageBase64}
              css="resizeMode:cover mat:2.5 clearwidth wi:50 he:90% bor:2"
            />
            <Text
              css="bold header pa:5"
              invertColor={true}>
              {item.name}
            </Text>
            <Text css="desc co:red absolute bo:5 right:10">
              {state.infoNovel[item.url] ||
                "loading"}
            </Text>
            <Text css="clearwidth desc co:red bottom bo:5 le:60">
              ({item.parserName})
            </Text>
          </View>
        )}
        itemCss="clearwidth mab:5 overflow bor:5"
        vMode={true}
      />
    </View>
  );
};
