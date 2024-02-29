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
  TextInput,
  ActionSheet
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
  const { fileItems } = g.files().useFile("json");
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
  );

  useEffect(() => {
    (async () => {
      for (let b of books) {
        if (b.parserName !== "epub") {
          let novel = await g.parser
            .find(b.parserName)
            .detail(b.url);
          if (novel) {
            state.infoNovel[b.url] = `(${
              b.selectedChapterIndex + 1
            }/${novel.chapters.length})`;
            updater();
          }
        }
        await sleep(500);
      }
    })();
  }, [books]);

  return (
    <View css="flex mih:100">
      {loader.elem}
      <ActionSheet
        title="Actions"
        onHide={() =>
          (g.selection.favoritItem = undefined)
        }
        visible={() =>
          g.selection.favoritItem !== undefined
        }
        height={300}>
        <View>
          <TouchableOpacity
            css="listButton"
            onPress={() => {
              options
                .nav("NovelItemDetail")
                .add({
                  url: g.selection.favoritItem
                    .url,
                  parserName:
                    g.selection.favoritItem
                      .parserName
                })
                .push();
              g.selection.favoritItem = undefined;
            }}>
            <Icon
              invertColor={true}
              name="info-circle"
              type="FontAwesome5"
            />
            <Text invertColor={true}>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            css="listButton"
            onPress={() => {
              options
                .nav("ReadChapter")
                .add({
                  url: g.selection.favoritItem
                    .url,
                  parserName:
                    g.selection.favoritItem
                      .parserName
                })
                .push();
              g.selection.favoritItem = undefined;
            }}>
            <Icon
              invertColor={true}
              name="book-reader"
              type="FontAwesome5"
            />
            <Text invertColor={true}>Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            css="listButton"
            onPress={() => {
              g.alert(
                `You will be deleting this novel.\nAre you sure?`,
                "Please Confirm"
              ).confirm(async answer => {
                loader.show();
                if (answer) {
                  try {
                    let file = fileItems.find(
                      x =>
                        x.url ==
                        g.selection.favoritItem
                          .url
                    );

                    if (file) {
                      await g.selection.favoritItem
                        .Favorit(false)
                        .saveChanges();
                    } else {
                      await g
                        .dbContext()
                        .deleteBook(
                          g.selection.favoritItem
                            .id
                        );
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  g.selection.favoritItem =
                    undefined;
                }
                loader.hide();
              });
            }}>
            <Icon
              invertColor={true}
              name="delete"
              type="MaterialIcons"
            />
            <Text invertColor={true}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
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
        onPress={x =>
          (g.selection.favoritItem = x)
        }
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
