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
  ActionSheet,
  FoldableItem,
  AlertDialog
} from "../components";
import * as React from "react";
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
  FileHandler,
  ZipBook
} from "../native";
import { sleep } from "../Methods";

const ItemRender = ({
  options,
  item,
  state,
  loader
}) => {
  context.hook("novelFavoritInfo");
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
        .Where.Column(x => x.url)
        .EqualTo(item.url),
      undefined,
      (items, op) => {
        return (
          items.find(
            x => x.url == item.url && x.favorit
          ) != undefined
        );
      }
    );

  useEffect(() => {
    (async () => {
      for (let b of books) {
        if (b.parserName !== "epub") {
          let novel = await context.parser
            .find(b.parserName)
            .detail(b.url);
          if (novel) {
            context.novelFavoritInfo[b.url] = `(${b.selectedChapterIndex + 1
              }/${novel.chapters.length})`;
            context.novelFavoritInfo = {
              ...context.novelFavoritInfo
            };
          }
        }
        await sleep(500);
      }
    })();
  }, [books]);

  item =
    books.find(x => x.url === item.url) ?? item;

  return (
    <FoldableItem
      single={true}
      css="wi:98% overflow"
      buttons={[
        {
          text: "Delete",
          icon: (
            <Icon
              name="delete"
              type="MaterialIcons"
              css="invertco"
            />
          ),
          onPress: () => {
            AlertDialog
              .confirm(
                {
                  message: `You will be deleting this novel.\nAre you sure?`,
                  title: "Please Confirm"
                }
              )
              .then(async answer => {
                loader.show();
                if (answer) {
                  try {
                    await item
                      .Favorit(false)
                      .saveChanges();
                  } catch (e) {
                    console.error(e);
                  }
                }
                loader.hide();
              });
          }
        },
        {
          icon: (
            <Icon
              name="book-reader"
              type="FontAwesome5"
              css="invertco"
            />
          ),
          text: "Read",
          onPress: () => {
            options
              .nav("ReadChapter")
              .add({
                name: item.name,
                url: item.url,
                parserName: item.parserName
              })
              .push();
            return true;
          }
        },
        {
          onPress: () => {
            options
              .nav("NovelItemDetail")
              .add({
                url: item.url,
                parserName: item.parserName
              })
              .push();
            return true;
          },
          icon: (
            <Icon
              name="info-circle"
              type="FontAwesome5"
              css="invertco"
            />
          ),
          text: "Info"
        }
      ]}>
      <View
        css="clearwidth bor:5 pal:5 par:5 he:60 row di:flex juc:flex-start invert">
        <Image
          url={item.imageBase64}
          css="resizeMode:cover mat:2.5 clearwidth wi:50 he:90% bor:2"
        />
        <Text
          css="header pa:5 maw:80% overflow">
          {item.name}
        </Text>
        <Text css="desc co:red absolute bo:5 right:10">
          {context.novelFavoritInfo[item.url] ||
            "loading"}
        </Text>
        <Text css="clearwidth desc co:red bottom bo:5 le:60">
          ({item.parserName})
        </Text>
      </View>
    </FoldableItem>
  );
};

export default ({ ...props }: any) => {
  const [_, options, navop] =
    useNavigation(props);
  const updater = useUpdate();

  const state = buildState({
    text: "",
    json: "",
    infoNovel: {}
  }).build();
  const { fileItems } = context
    .files
    .useFile("json");
  const [books, dataIsLoading, reload] = context
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
        .EqualTo(true),
      undefined,
      (items, op) => {
        if (books.length <= 0) return true;
        let favs = items.filter(x => x.favorit);
        if (
          favs.find(
            x => !books.find(f => f.url == x.url)
          )
        )
          return true;

        if (
          items.find(x =>
            books.find(
              f =>
                f.url == x.url &&
                x.favorit !== f.favorit
            )
          )
        )
          return true;
        return false;
      }
    );
  const loader = useLoader(dataIsLoading);

  return (
    <View css="flex mih:100">
      {loader.elem}
      <Header
        {...navop}
        value={state.text}
        inputEnabled={true}
        onInputChange={txt => {
          state.text = txt;
        }}
      />
      <View css="flex mih:100">
        <ItemList
          css="flex"
          items={books?.filter(x =>
            x.name.has(state.text)
          )}
          container={({ item }) => (
            <ItemRender
              loader={loader}
              options={options}
              state={state}
              item={item}
            />
          )}
          itemCss="clearwidth ali:center juc:center mab:5 overflow bor:5"
          vMode={true}
        />
      </View>
    </View>
  );
};
