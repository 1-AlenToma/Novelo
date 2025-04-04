import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  ProgressBar,
  FoldableItem,
  AlertDialog
} from "../components";
import Header from "./Header";
import * as React from "react";
import {
  useNavigation,
  useUpdate,
  useDbHook,
  useView
} from "../hooks";
import { Book } from "../db";
import {
  FileHandler,
  ZipBook,
  EpubBuilder
} from "../native";
import { ReadDirItem } from "react-native-fs";
const EpubHandler = ({
  parentState
}: any) => {
  const [render, state, loader] = useView({
    component: false,
    state: {
      skipImages: false,
      browserVisible: false
    }
  });
  const loadEpub = async (item: ReadDirItem) => {
    let fileName = "";
    try {
      /* let item = await DockPicker.pickSingle({
         copyTo: "cachesDirectory",
         type: "application/epub+zip"
       });
 
       if (!item || !item.fileCopyUri) return;*/
      state.browserVisible = false;
      AlertDialog.confirm(
        {
          message: `When parsing the epub, saving images may couse the app to crash so ignoring those may help in parsing the epub file. Recomended to use!\nShould I skip them?`,
          title: "Please Confirm"
        }
      )
        .then(async answer => {
          state.skipImages = answer;
          try {
            loader.show();
            await context.db.disableHooks();
            await context.db.disableWatchers();
            context.files.disable();
            let uri: any = item.path;
            let name: any = item.name;
            console.log("loading Epub")
            let bk = await ZipBook.load(uri, name, p => {
              loader.show(p);
            },
              state.skipImages
            );

            console.log("finished Loading epub")
            let images = bk.files.filter(
              x => x.type === "Image"
            );
            let total = images.length;
            let count = 0;
            const calc = async () => {
              count++;
              loader.show((100 * count) / total);
            };
            let displayImage: any = undefined;
            if (!state.skipImages) {
              bk.imagePath = folderValidName(bk.name);
              for (let file of images) {

                await calc();
                if (file.url && !file.url.empty()) {
                  let path = await context.imageCache
                    .write(bk.imagePath.path(getFileInfoFromUrl(file.fileName ?? file.url)).trimEnd("/"), file.content);
                  file.content = path;
                  if (!displayImage)
                    displayImage = bk.imagePath.path(getFileInfoFromUrl(file.fileName ?? file.url)).trimEnd("/");
                }
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

            let img = bk.files.find(
              x => x.type === "Image"
            );

            if (!displayImage)
              displayImage = img?.content;
            let book = Book.n()
              .Name(bk.name)
              .Url(bk.url)
              .Favorit(false)
              .InlineStyle(
                bk.files
                  .filter(x => x.type === "CSS")
                  .map(x => x.content)
                  .join("\n")
              ).ImageBase64(displayImage ?? "")
              .ParserName("epub");
            bk.files = []; // clear files as it is not needed anymore
            fileName = "".fileName(bk.name, "epub")
            await context.files.write("".fileName(bk.name, "epub"), JSON.stringify(bk));
            await context.db.save(book);
          } catch (e) {
            AlertDialog.alert({ message: e.message });
            console.error(e);
            if (fileName.has())
              context.files.delete(fileName);
          } finally {
            context.db.enableWatchers();
            context.db.enableHooks();
            context.files.enable();
            loader.hide();
          }
        });
    } catch (e) {
      AlertDialog.alert({ message: e.message });
      console.error(e);
    }
  };

  return render(
    <>
      <View
        ifTrue={() =>
          loader.elem ? true : false
        }
        css="absolute clearboth zi:500 clb">
        <View css="clearboth he:80 zi:500 juc:center ali:center absolute le:0 to:40% clb">
          {loader.elem}
        </View>
      </View>
      <Header
        buttons={[
          {
            text: () => (
              <Icon
                size={35}
                name="file-directory"
                type="Octicons"
              />
            ),
            press: async () => {
              let uri = await context.browser.pickFile(["epub"], "Select Epub file");
              if (uri)
                loadEpub(uri)
            }
          }
        ]}
        value={parentState.text}
        inputEnabled={true}
        onInputChange={txt => {
          parentState.text = txt;
        }}
      />
    </>
  );
};
const ItemRender = ({
  item,
  state
}: any) => {
  if (!item) return null;
  context.hook("parser.all")
  const [books, dataIsLoading] = context
    .db.Books.useQuery(
      context.db.Books.query.load("chapterSettings").where.column(x => x.url).equalTo(item.url),
      (items, op) => {
        return (
          items.find(x => x.url == item.url) !=
          undefined
        )
      }
    );
  const { fileItems, elem } = context
    .files
    .useFile("json", x => {
      return x.has(
        "".fileName(
          item.name,
          item.parserName
        )
      );
    });
  const loader = useLoader(true);
  const urls = context
    .downloadManager()
    .useDownload();
  let urlObj = urls.reduce((c, v) => {
    c[v.url] = v;
    return c;
  }, {});
  const itemState = buildState({
    info: undefined as string | undefined
  }).build();

  useEffect(() => {
    getInfo(
      books.find(x => x.url === item.url) ?? item
    );
  }, [books, fileItems]);

  let getInfo = async (b: any) => {
    loader.show();
    let novel = fileItems.find(
      x => x.url == b.url
    );
    if (novel) {
      itemState.info = `(${b.selectedChapterIndex + 1
        }/${novel.chapters.filter(
          x => x.content && x.content.has()
        ).length
        })`;
    }
    loader.hide();
  };
  item = books.find(x => x.url === item.url) ?? item;
  const novelInfo = fileItems.find(x => item.url === x.url);
  return (
    <FoldableItem
      single={true}
      enabled={(novelInfo?.chapters.length ?? 0) > 0}
      css="wi:98% overflow"
      buttons={[
        {
          ifTrue: () =>
            item.parserName !== "epub" && item.isOnline?.() &&
            !context.downloadManager().items.has(item.url ?? ""),
          icon: (
            <Icon
              name="update"
              type="MaterialIcons"
              css="invertco"
            />
          ),
          text: "Update",
          onPress: () => {
            context
              .downloadManager()
              .download(
                item.url,
                item.parserName
              );
            return true;
          }
        },
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
                    let file = fileItems.find(x => x.url == item.url);

                    if (file) {
                      if (item.parserName == "epub" || !item.favorit) {
                        await context.db.deleteBook(item.id);
                      }
                      await file.deleteFile();

                      if (context.appSettings.currentNovel && context.appSettings.currentNovel.url == item.url) {
                        context.appSettings.currentNovel = {} as any;
                        await context.appSettings.saveChanges();
                      }


                    }
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
              css="invertco"
              name="book-reader"
              type="FontAwesome5"
            />
          ),
          text: "Read",
          onPress: () => {
            context
              .nav.navigate(context.parser.find(item.parserName)?.type == "Anime" ? "WatchAnime" : "ReadChapter", {
                name: item.name,
                url: item.url,
                parserName: item.parserName,
                epub: true
              });
            return true;
          }
        },
        {
          onPress: () => {
            context
              .nav.navigate("NovelItemDetail", {
                url: item.url,
                parserName: item.parserName
              });
            return true;
          },
          icon: (
            <Icon
              css="invertco"
              name="info-circle"
              type="FontAwesome5"
            />
          ),
          text: "Info",
          ifTrue: () => item.parserName != "epub" && item.isOnline?.()
        }
      ]}>
      <View
        css="clearwidth bor:5 pal:5 he:60 row di:flex juc:flex-start invert">
        {loader.elem ?? elem}
        <Image
          url={item.imageBase64}
          css="resizeMode:cover mat:2.5 clearwidth wi:50 he:90% bor:2"
        />
        <Text
          css="header pa:5 maw:80% overflow">
          {item.name}
        </Text>
        <Text css="desc co:red absolute bo:5 right:10 zi:6">
          {itemState.info || "loading"}
        </Text>
        <Text css="clearwidth desc co:red bottom bo:5 le:60">
          {item.parserName != "epub" ? ` (${item.parserName})` : " (Epub)"}
          {!item.isOnline?.() ? " Missing parser" : ""}
        </Text>
        <View
          ifTrue={urlObj[item.url] ? true : false}
          css="clearboth absolute row juc:flex-end ali:center">

          <ProgressBar value={(urlObj[item.url]?.p ?? 0) / 100}>
            <Text css="fos-12 bold co-#FFFFFF">{(urlObj[item.url]?.p ?? 0).readAble()}%</Text>
          </ProgressBar>
          <TouchableOpacity
            css="button zi:6 miw:30 clb"
            onPress={() =>
              context
                .downloadManager()
                .stop(item.url)
            }>
            <Icon
              name="controller-stop"
              type="Entypo"
              css="zi:7"
            />
          </TouchableOpacity>
        </View>
      </View>
    </FoldableItem>
  );
};

export default ({ ...props }: any) => {
  const state = buildState({
    text: "",
    selectedItem: undefined,
    skipImages: false
  }).build();

  const { fileItems, elem } = context
    .files
    .useFile("json", undefined, "NewDelete");
  const [books, dataIsLoading, reload] = context
    .db.useQuery(
      "Books",
      context
        .db.Books.query.load("chapterSettings")
        .where.column(x => x.url)
        .in(fileItems.map(x => x.url)),
      undefined,
      (_items) => {
        if (books.length <= 0) return true;
        return false;
      }
    );
  const loader = useLoader(dataIsLoading);
  useEffect(() => {
    reload();
  }, [fileItems]);

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
      <View
        ifTrue={() =>
          loader.elem ?? elem ? true : false
        }
        css="clearboth he:80 zi:500 juc:center ali:center absolute le:0 to:40%">
        {loader.elem ?? elem}
      </View>

      <EpubHandler parentState={state} />
      <Text
        css="desc co-red fow-bold tea-left wi-100% pal-5">
        Downloaded and Added Epubs
      </Text>

      <View css="flex mih:100">
        <ItemList
          items={books?.filter(x =>
            x.name.has(state.text)
          )}
          container={({ item }) => (
            <ItemRender
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
