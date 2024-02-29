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
  ProgressBar
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
  ZipBook,
  EpubBuilder
} from "../native";
import { sleep } from "../Methods";
let lock = false;
const ItemRender = ({ item, state }: any) => {
  const { fileItems } = g
    .files()
    .useFile("json", x => item.url == x.url);
  const loader = useLoader(true);
  const urls = g.downloadManager().useDownload();
  const itemState = useState({
    info: undefined
  });

  useEffect(() => {
    getInfo(item);
  }, [fileItems]);

  let getInfo = async (b: any) => {
    while (lock) await sleep(100);
    lock = true;
    loader.show();
    let novel = fileItems.find(
      x => x.url == b.url
    );
    if (novel) {
      itemState.info = `(${
        b.selectedChapterIndex + 1
      }/${
        novel.chapters.filter(
          x => x.content && x.content.has()
        ).length
      })`;
      await sleep(400);
    }
    lock = false;
    loader.hide();
  };

  return (
    <View
      invertColor={true}
      css="clearboth pal:5 he:60 row di:flex juc:flex-start">
      {loader.elem}
      <Image
        url={item.imageBase64}
        css="resizeMode:cover mat:2.5 clearwidth wi:50 he:90% bor:2"
      />
      <Text
        css="bold header pa:5 maw:80% overflow"
        invertColor={true}>
        {item.name}
      </Text>
      <Text css="desc co:red absolute bo:5 right:10 zi:6">
        {itemState.info || "loading"}
      </Text>
      <Text css="clearwidth desc co:red bottom bo:5 le:60">
        {item.parserName != "epub"
          ? ` (${item.parserName})`
          : " (Epub)"}
      </Text>
      <View
        ifTrue={
          urls.find(x => x.url == item.url)
            ? true
            : false
        }
        css="clearboth absolute row juc:flex-end ali:center">
        <TouchableOpacity
          css="button zi:6 miw:30"
          onPress={() =>
            g.downloadManager().stop(item.url)
          }>
          <Icon
            invertColor={true}
            name="controller-stop"
            type="Entypo"
          />
        </TouchableOpacity>
        <ProgressBar
          procent={
            urls.find(x => x.url == item.url)?.p
          }
        />
      </View>
    </View>
  );
};

export default ({ ...props }: any) => {
  const [_, options, navop] =
    useNavigation(props);
  const updater = useUpdate();
  const loader = useLoader();
  const state = useState({
    text: "",
    selectedItem: undefined
  });
  const { fileItems } = g
    .files()
    .useFile("json", undefined, "New");
  const [books, dataIsLoading, reload] = g
    .db()
    .useQuery(
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
        .Where.Column(x => x.url)
        .IN(fileItems.map(x => x.url))
    );

  useEffect(() => {
    reload();
  }, [fileItems]);

  const loadEpub = async () => {
    try {
      loader.show();
      let { assets } =
        await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          type: "application/epub+zip"
        });
      let uri = assets?.firstOrDefault("uri");
      let name = assets?.firstOrDefault("name");
      let bk = await ZipBook.load(uri, name);
      let book = Book.n()
        .Name(bk.name)
        .Url(bk.url)
        .Favorit(false)
        .InlineStyle(
          bk.files
            .filter(x => x.type === "CSS")
            .map(x => x.content)
            .join("\n")
        )
        .ImageBase64(
          bk.files.find(x => x.type === "Image")
            ?.content ?? ""
        )
        .ParserName("epub");
      await g
        .files()
        .write(bk.url, JSON.stringify(bk));
      //console.log([bk].niceJson("content"));
      await g.db().save(book);
    } catch (e) {
      console.error(e);
    }
    loader.hide();
  };

  const downloadEpub = async (book: any) => {
    let file = fileItems.find(
      x => x.url === book.url
    );
    let builder = new EpubBuilder({
      title: book.name,
      fileName: book.name,
      language: "en",
      description: "",
      stylesheet: {
        novel: {
          width: "95%",
          "min-height": "50%",
          position: "relative",
          overflow: "hidden",
          "text-align-vertical": "top",
          "font-size":
            g.appSettings.fontSize + "px",
          "line-height":
            g.appSettings.fontSize * 1.7 + "px",
          "text-align": g.appSettings.textAlign,
          "font-weight": g.appSettings.isBold
            ? "bold"
            : "normal"
        }
      },
      chapters: file.chapters.map(x => {
        return {
          fileName: x.name,
          title: x.name,
          htmlBody: x.content
        };
      })
    });

    let items = await builder.constructEpub();
    //console.log([items].niceJson("content"));
  };

  return (
    <View css="flex mih:100">
      {loader.elem}
      <ActionSheet
        title="Actions"
        onHide={() =>
          (g.selection.downloadSelectedItem =
            undefined)
        }
        visible={() =>
          g.selection.downloadSelectedItem !==
          undefined
        }
        height={300}>
        <View>
          <TouchableOpacity
            css="listButton"
            onPress={() => {
              options
                .nav("ReadChapter")
                .add({
                  url: g.selection
                    .downloadSelectedItem.url,
                  parserName:
                    g.selection
                      .downloadSelectedItem
                      .parserName,
                  epub: true
                })
                .push();
              g.selection.downloadSelectedItem =
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
                        g.selection
                          .downloadSelectedItem
                          .url
                    );

                    if (file) {
                      if (
                        g.selection
                          .downloadSelectedItem
                          .parserName == "epub" ||
                        !g.selection
                          .downloadSelectedItem
                          .favorit
                      ) {
                        await g
                          .dbContext()
                          .deleteBook(
                            g.selection
                              .downloadSelectedItem
                              .id
                          );
                      }
                      await file.deleteFile();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  g.selection.downloadSelectedItem =
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
          <TouchableOpacity
            ifTrue={() =>
              g.selection.downloadSelectedItem
                ?.parserName !== "epub" &&
              !g
                .downloadManager()
                .items.has(
                  g.selection.downloadSelectedItem
                    ?.url ?? ""
                )
            }
            css="listButton"
            onPress={() => {
              g.downloadManager().download(
                g.selection.downloadSelectedItem
                  .url,
                g.selection.downloadSelectedItem
                  .parserName
              );
              g.selection.downloadSelectedItem =
                undefined;
            }}>
            <Icon
              invertColor={true}
              name="update"
              type="MaterialIcons"
            />
            <Text invertColor={true}>Update</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
      <View
        invertColor={true}
        css="band overflow clearwidth par:5 he:40 ali:flex-end relative juc:center di:flex">
        <Text
          invertColor={true}
          css="header absolute le:5">
          Downloaded and Added Epubs
        </Text>
        <TouchableOpacity onPress={loadEpub}>
          <Icon
            invertColor={true}
            size={35}
            name="file-zip"
            type="Octicons"
          />
        </TouchableOpacity>
      </View>
      <View css="juc:flex-start clearwidth ali:center he:30 mab:10 mat:10">
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
          (g.selection.downloadSelectedItem = x)
        }
        items={books?.filter(x =>
          x.name.has(state.text)
        )}
        container={({ item }) => (
          <ItemRender
            state={state}
            item={item}
          />
        )}
        itemCss="clearwidth mab:5 overflow bor:5"
        vMode={true}
      />
    </View>
  );
};
