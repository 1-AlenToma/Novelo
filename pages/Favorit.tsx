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
  const { fileItems } = context
    .files()
    .useFile("json");
  const [books, dataIsLoading] = context
    .db()
    .useQuery(
      "Books",
      context
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
          let novel = await context.parser
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
          (context.selection.favoritItem =
            undefined)
        }
        visible={() =>
          context.selection.favoritItem !==
          undefined
        }
        height={300}>
        <View>
          <TouchableOpacity
            css="listButton"
            onPress={() => {
              options
                .nav("NovelItemDetail")
                .add({
                  url: context.selection
                    .favoritItem.url,
                  parserName:
                    context.selection.favoritItem
                      .parserName
                })
                .push();
              context.selection.favoritItem =
                undefined;
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
                  url: context.selection
                    .favoritItem.url,
                  parserName:
                    context.selection.favoritItem
                      .parserName
                })
                .push();
              context.selection.favoritItem =
                undefined;
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
              context
                .alert(
                  `You will be deleting this novel.\nAre you sure?`,
                  "Please Confirm"
                )
                .confirm(async answer => {
                  loader.show();
                  if (answer) {
                    try {
                      let file = fileItems.find(
                        x =>
                          x.url ==
                          context.selection
                            .favoritItem.url
                      );

                      if (file) {
                        awaitcontext.selection.favoritItem
                          .Favorit(false)
                          .saveChanges();
                      } else {
                        await g
                          .dbContext()
                          .deleteBook(
                            context.selection
                              .favoritItem.id
                          );
                      }
                    } catch (e) {
                      console.error(e);
                    }
                    context.selection.favoritItem =
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
      <Header
        {...navop}
        value={state.text}
        inputEnabled={true}
        onInputChange={txt => {
          state.text = txt;
        }}
      />

      <ItemList
        css="flex"
        onPress={x =>
          (context.selection.favoritItem = x)
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
