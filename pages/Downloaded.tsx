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
  ProgressBar,
  Modal
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
  ZipBook,
  EpubBuilder
} from "../native";
import { sleep } from "../Methods";
const ItemRender = ({ item, state }: any) => {
  if (!item) return null;
  const { fileItems, elem } = context
    .files()
    .useFile("json", x => {
      return x.has(
        "".fileName(
          item.url,
          item.parserName == "epub"
            ? ""
            : item.parserName
        )
      );
    });
  const loader = useLoader(true);
  const urls = context
    .downloadManager()
    .useDownload();
  const itemState = useState({
    info: undefined
  });

  useEffect(() => {
    getInfo(item);
  }, [fileItems]);

  let getInfo = async (b: any) => {
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
    }
    loader.hide();
  };

  return (
    <View
      invertColor={true}
      css="clearboth pal:5 he:60 row di:flex juc:flex-start">
      {loader.elem ?? elem}
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
            context
              .downloadManager()
              .stop(item.url)
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
  const state = useState({
    text: "",
    selectedItem: undefined,
    skipImages: false
  });
  const loader = useLoader();
  const { fileItems, elem } = context
    .files()
    .useFile("json", undefined, "NewDelete");
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
        .Where.Column(x => x.url)
        .IN(fileItems.map(x => x.url))
    );

  useEffect(() => {
    reload();
  }, [fileItems]);

  const loadEpub = async () => {
    try {
      let { assets } =
        await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          type: "application/epub+zip"
        });
      if (!assets || assets.length <= 0) return;
      context
        .alert(
          `When parsing the epub, saving images may couse the app to crash so ignoring those may help in parsing the epub file. Recomended to use!\nShould I skip theme?`,
          "Please Confirm"
        )
        .confirm(async answer => {
          state.skipImages = answer;
          try {
            loader.show();
            await context.db().disableHooks();
            await context.db().disableWatchers();
            context.files().disable();
            let uri =
              assets?.firstOrDefault("uri");
            let name =
              assets?.firstOrDefault("name");
            let bk = await ZipBook.load(
              uri,
              name,
              p => {
                loader.show(p);
              },
              state.skipImages
            );
            let images = bk.files.filter(
              x => x.type === "Image"
            );
            let total = images.length;
            let count = 0;
            const calc = async () => {
              count++;
              loader.show((100 * count) / total);
            };
            if (!state.skipImages) {
              for (let file of images) {
                await calc();
                file.content = await g
                  .imageCache()
                  .write(file.url, file.content);
              }

              let chImage =
                ZipBook.createImageChapter(
                  images
                );
              if (chImage)
                bk.chapters = [
                  chImage,
                  ...bk.chapters
                ];
            }
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
                bk.files.find(
                  x => x.type === "Image"
                )?.content ?? ""
              )
              .ParserName("epub");
            await g
              .files()
              .write(bk.url, JSON.stringify(bk));
            await context.db().save(book);
          } catch (e) {
            context.alert(e.message).show();
            console.error(e);
          } finally {
            context.db().enableWatchers();
            context.db().enableHooks();
            context.files().enable();
            loader.hide();
          }
        });
    } catch (e) {
      context.alert(e.message).show();
      console.error(e);
    }
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
            context.appSettings.fontSize + "px",
          "line-height":
            context.appSettings.fontSize * 1.7 +
            "px",
          "text-align":
            context.appSettings.textAlign,
          "font-weight": context.appSettings
            .isBold
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
  };

  return (
    <View css="flex mih:100">
      {loader.elem ?? elem}
      <ActionSheet
        title="Actions"
        onHide={() =>
          (context.selection.downloadSelectedItem =
            undefined)
        }
        visible={() =>
          context.selection
            .downloadSelectedItem !== undefined
        }
        height={300}>
        <View>
          <TouchableOpacity
            css="listButton"
            ifTrue={() =>
              context.selection
                .downloadSelectedItem
                ?.parserName != "epub"
            }
            onPress={() => {
              options
                .nav("NovelItemDetail")
                .add({
                  url: context.selection
                    .downloadSelectedItem.url,
                  parserName:
                    context.selection
                      .downloadSelectedItem
                      .parserName
                })
                .push();
              context.selection.downloadSelectedItem =
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
                    .downloadSelectedItem.url,
                  parserName:
                    context.selection
                      .downloadSelectedItem
                      .parserName,
                  epub: true
                })
                .push();
              context.selection.downloadSelectedItem =
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
                            .downloadSelectedItem
                            .url
                      );

                      if (file) {
                        if (
                          context.selection
                            .downloadSelectedItem
                            .parserName ==
                            "epub" ||
                          !context.selection
                            .downloadSelectedItem
                            .favorit
                        ) {
                          await g
                            .dbContext()
                            .deleteBook(
                              context.selection
                                .downloadSelectedItem
                                .id
                            );
                        }
                        await file.deleteFile();
                      }
                    } catch (e) {
                      console.error(e);
                    }
                    context.selection.downloadSelectedItem =
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
              context.selection
                .downloadSelectedItem
                ?.parserName !== "epub" &&
              !g
                .downloadManager()
                .items.has(
                  context.selection
                    .downloadSelectedItem?.url ??
                    ""
                )
            }
            css="listButton"
            onPress={() => {
              context
                .downloadManager()
                .download(
                  context.selection
                    .downloadSelectedItem.url,
                  context.selection
                    .downloadSelectedItem
                    .parserName
                );
              context.selection.downloadSelectedItem =
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

      <Header
        {...navop}
        buttons={[
          {
            text: () => (
              <Icon
                invertColor={true}
                size={35}
                name="file-zip"
                type="Octicons"
              />
            ),
            press: () => {
              loadEpub();
            }
          }
        ]}
        value={state.text}
        inputEnabled={true}
        onInputChange={txt => {
          state.text = txt;
        }}
      />
      <Text
        invertColor={false}
        css="header pa:10 clearwidth">
        Downloaded and Added Epubs
      </Text>
      <ItemList
        css="flex"
        onPress={x =>
          (context.selection.downloadSelectedItem =
            x)
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
