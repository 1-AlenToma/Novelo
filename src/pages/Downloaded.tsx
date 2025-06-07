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
  useView
} from "../hooks";
import { Book } from "../db";
import {
  DetailInfo,
  FileHandler,
  ZipBook,
  createEpub,
  readEpub
} from "../native";
import { ReadDirItem } from "react-native-fs";
const EpubHandler = ({
  parentState
}: any) => {
  const [render, state, loader] = useView({
    component: false,
    state: {
      skipImages: false,
      progress: {
        percent: 0,
        currentFile: ""
      }
    }
  });
  const loadEpub = async (item: ReadDirItem) => {
    try {
      loader.show();
      await readEpub(item.path, (info) => {
        state.progress = { ...info, percent: info.percent / 100 }
      });
    } catch (e) {
      AlertDialog.alert({ message: e.message });
      console.error(e);
    } finally {
      loader.hide();
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
          <ProgressBar css="_abc he-100% bac-red" ifTrue={state.progress.percent > 0 && state.progress.percent < 1 && loader.loading} value={state.progress.percent}>
            <Text css="fos-12 bold co-#FFFFFF">{state.progress.currentFile}</Text>
          </ProgressBar>
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
          parentState.text = txt ?? "";
        }}
      />
    </>
  );
};
const ItemRender = ({
  item,
  state
}: {
  state: any,
  item: Book
}) => {
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
  const { fileItems, elem } = context.files.useFile<DetailInfo>("json", x => {
    return x.has(
      "".fileName(
        item.name,
        item.parserName
      )
    );
  });
  const loader = useLoader(true);
  const downloadProgress = context.downloadManager().useDownload(item.url);

  const itemState = buildState(() =>
  ({
    info: undefined as string | undefined,
    downloadFileInfo: {
      percent: 0,
      currentFile: ""
    }
  })).ignore("downloadFileInfo").build();

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

  const downloadEpub = async () => {
    let file = fileItems.find(
      x => x.url === item.url
    );
    if (file) {
      const path = await context.browser.pickFolder("Choose where to save the file", ["epub"]);
      if (path) {
        loader.show();
        await createEpub(file, item, path.path, (info) => {
          if (info)
            itemState.downloadFileInfo = { ...info, percent: info.percent / 100 };
        });
      }

      loader.hide();
    }
  };


  const novelInfo = fileItems.find(x => item.url === x.url);
  return (
    <FoldableItem
      single={true}
      enabled={(novelInfo?.chapters.length ?? 0) > 0 && downloadProgress <= 0}
      css="wi:98% overflow"
      buttons={[
        {
          icon: (
            <Icon
              name="file-download"
              type="MaterialIcons"
              css="invertco"
            />
          ),
          text: "Download",
          onPress: () => {
            downloadEpub();
            return true;
          }
        },
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
        <ProgressBar css="_abc he-100% bac-red" ifTrue={itemState.downloadFileInfo.percent > 0 && itemState.downloadFileInfo.percent < 1 && loader.loading} value={itemState.downloadFileInfo.percent}>
          <Text css="fos-12 bold co-#FFFFFF">{itemState.downloadFileInfo.currentFile}</Text>
        </ProgressBar>
        <Image
          url={item.imageBase64}
          css="resizeMode:cover mat:2.5 clearwidth wi:50 he:90% bor:2"
        />
        <Text
          numberOfLines={1}
          css="header pa:5 maw:80% overflow">
          {item.name}
        </Text>
        <Text css="desc co:red fow-bold fos-12 absolute bo:5 right:10 zi:6">
          {itemState.info || "loading"}
        </Text>
        <Text css="clearwidth desc fow-bold fos-12 co:red bottom bo:5 le:60">
          Source:{item.parserName != "epub" ? ` ${item.parserName}` : " Epub"}
          {novelInfo?.type ? ` | ${novelInfo?.type}` : ""}
          {!item.isOnline?.() ? " Missing parser" : ""}
        </Text>
        <View
          ifTrue={downloadProgress > 0 ? true : false}
          css="clearboth wi-102% absolute row juc:flex-end ali:center">

          <ProgressBar css="_abc he-100%" value={downloadProgress / 100}>
            <Text css="fos-12 bold co-#FFFFFF">{downloadProgress.readAble()}%</Text>
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
  const state = buildState(() =>
  ({
    text: "",
    selectedItem: undefined,
    skipImages: false
  })).build();

  const { fileItems, elem } = context.files.useFile<DetailInfo>("json", undefined, "NewDelete");
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

  return (
    <View css="flex mih:100 invert ali-center">
      <EpubHandler parentState={state} />
      <View css="itemListContainer">
        <Text
          css="desc fos-12 co-red fow-bold tea-left wi-100% pal-10">
          Downloaded and Added Epubs
        </Text>
        <ItemList
          items={books?.filter(x => {
            const file = fileItems.find(x => x.url == x.url)
            return !state.text.has() || x.name.has(state.text) || x.parserName.has(state.text) || (context.parser.find(x.parserName)?.type ?? "").has(state.text) || file?.type?.has(state.text)
          }
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
        <View
          ifTrue={() =>
            loader.elem ?? elem ? true : false
          }
          css="clearboth he:80 zi:500 juc:center ali:center absolute le:0 to:40%">
          {loader.elem ?? elem}
        </View>
      </View>
    </View>
  );
};
