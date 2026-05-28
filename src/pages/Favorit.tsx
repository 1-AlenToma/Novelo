import {
  useLoader,
  Image,
  ItemList,
  FoldableItem,
  ChapterView,
} from "../components";
import { View, Text, Icon, AlertDialog, ActionSheet, ReadyView, Collabse, ScrollView } from "react-native-short-style/mems";
import * as React from "react";
import Header from "./Header";
import { Book } from "../db";
import { DetailInfo } from "../native";
import { CollabsData } from "../Types";

const ItemRender = React.memo(({
  url,
  hideParserDetail
}: {
  url: string;
  hideParserDetail?: boolean
}) => {
  const itemLoader = useLoader(false);
  const { mem, memKey } = useFunc();
  const state = buildState({
    novel: undefined as DetailInfo | undefined,
    showChapter: false
  }).ignore("novel").build();

  context.hook("novelFavoritInfo");
  const [books, dataIsLoading] = context.db.Books.useQuery(()=> context.db.Books.query.load("chapterSettings").where.column(x => x.url).equalTo(url).toList(),
  (items, op) => (items.find(x => x.url == url && x.favorit) != undefined));
  const item = mem((books.find(x => x.url === url) ?? { url }) as Book, books);

  context.cache.onDirDelete((parserName) => {
    if (!parserName || parserName == item.parserName)
      loadNovelDetail();
  });

  const loadNovelDetail = mem(async (refresh?: boolean) => {
    itemLoader.show();
    console.info("loading NovelDetail(Favorit)");
    for (let b of books) {
      if (b.parserName !== "epub") {
        let parser = context.parser.find(b.parserName);
        let novel = await parser?.detail(b.url, undefined, refresh === true ? "RenewMemo" : undefined);
        if (novel) {
          context.novelFavoritInfo[b.url] = `(${b.selectedChapterIndex + 1}/${novel.chapters.length})`;
          context.novelFavoritInfo = { ...context.novelFavoritInfo };
        } else if (!parser) {
          context.novelFavoritInfo[b.url] = `(Missing parser ${b.parserName})`;
          context.novelFavoritInfo = { ...context.novelFavoritInfo };
        }
      }
    }
    itemLoader.hide();
  }, books)

  const loadNovel = mem(async () => {
    try {
      itemLoader.show();
      let parser = context.parser.find(item.parserName);
      if (parser) {
        if (!state.novel)
          state.novel = await parser.detail(item.url, true);
        state.showChapter = true;
      } else console.error("parser not founc", item.parserName)
    } finally {
      itemLoader.hide();
    }

    return true;

  }, item)

  useEffect(() => {
    loadNovelDetail();
  }, [books]);

  context.useEffect(() => loadNovelDetail(), "parser.all")
  if (!item.name)
    return null;
  return (
    <>

      <ActionSheet size={"80%"} speed={100} css="invert" isVisible={state.showChapter} onHide={mem(() => state.showChapter = false)}>
        <ChapterView
          ignoreChapterValidation={true}
          book={item}
          novel={state.novel}
          onPress={memKey("ChapterViewVisibile", item => {
            if (state.novel) {
              context
                .nav.navigate(state.novel.type == "Anime" || context.parser.find(state.novel.parserName)?.type == "Anime" ? "WatchAnime" : "ReadChapter", {
                  name: state.novel.name,
                  chapter: item.url,
                  url: state.novel.url,
                  parserName: state.novel.parserName
                });
            }
            state.showChapter = false;
          })}
          current={
            state.novel?.chapters?.at(
              item?.selectedChapterIndex ?? 0
            )?.url
          }
        />
      </ActionSheet>

      {itemLoader.elem}
      <FoldableItem
        single={true}
        css="wi:98% overflow"
        buttons={mem([
          {
            text: "Delete",
            icon:
              <Icon
                name="delete"
                type="MaterialIcons"
                css="invertco"
              />,
            onPress: () => {
              AlertDialog
                .confirm(
                  {
                    message: `You will be deleting ${item.name}.\nAre you sure?`,
                    title: "Please Confirm"
                  }
                )
                .then(async answer => {
                  itemLoader.show();
                  if (answer) {
                    try {
                      let file = await context.files.exists("".fileName(item.name, item.parserName));
                      if (file) {
                        item.favorit = false;
                        await item.saveChanges();
                      } else await context.db.deleteBook(item.id);
                    } catch (e) {
                      console.error(e);
                    }
                  }
                  itemLoader.hide();
                });
            }
          },
          {
            icon:
              (<Icon
                name="refresh"
                type="FontAwesome"
                css="invertco"
              />
              ),
            ifTrue: item.isOnline?.(),
            text: "Refresh",
            onPress: () => {
              loadNovelDetail(true)
              return true;
            }
          },
          {
            ifTrue: item.isOnline?.(),
            onPress: async () => {
              itemLoader.show();
              return await loadNovel()
            },
            icon: <Icon
              type="AntDesign"
              name="menu"
              css="invertco"
            />,
            text: "Chapters"
          },
          {
            icon: (
              <Icon
                name="book-reader"
                type="FontAwesome5"
                css="invertco"
              />
            ),
            ifTrue: item.isOnline?.(),
            text: context.parser.find(item.parserName)?.type == "Anime" ? "Watch" : "Read",
            onPress: () => {
              context
                .nav.navigate(context.parser.find(item.parserName)?.type == "Anime" ? "WatchAnime" : "ReadChapter", {
                  name: item.name,
                  url: item.url,
                  parserName: item.parserName
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
                name="info-circle"
                type="FontAwesome5"
                css="invertco"
              />
            ),
            ifTrue: item.isOnline?.(),
            text: "Info"
          }
        ], item)}>
        <View
          css="clearwidth bor:5 pal:5 par:5 he:60 row di:flex juc:flex-start invert">
          <Image
            url={item.imageBase64}
            css="resizeMode:cover mat:2.5 clearwidth wi:50 he:90% bor:2"
          />
          <Text
            numberOfLines={1}
            css="header pa:5 maw:80% overflow">
            {item.name}
          </Text>
          <Text css="desc co:red fow-bold fos-12 absolute bo:5 right:10">
            {context.novelFavoritInfo[item.url] ||
              "loading"}
          </Text>
          <Text ifTrue={hideParserDetail !== true} css="clearwidth desc fow-bold fos-12 co:red bottom bo:5 le:60">
            ({item.parserName} | {context.parser.find(item.parserName)?.type})
          </Text>
        </View>
      </FoldableItem >
    </>
  );
});

export default ({ ...props }: any) => {
  const { mem, memKey } = useFunc();
  const state = buildState(() =>
  ({
    text: "",
    json: "",
    infoNovel: {},
    data: [] as CollabsData<Book>[],
  })).ignore("data").build();
  context.hook("size");
  const [books, dataIsLoading, reload] = context
    .db.useQuery(
      "Books",
      context.db.Books.query.where.column(x => x.favorit).equalTo(true).orderByAsc(x => [x.parserName, x.name]),
      undefined,
      (items, op) => {
        if (books.length <= 0) return true;
        let favs = items.filter(x => x.favorit);
        if (favs.find(x => !books.find(f => f.url == x.url)))
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
  useEffect(() => {
    if (dataIsLoading)
      return;

    let data = books.reduce((c, v) => {
      let title = `${v.parserName} | ${context.parser.find(v.parserName)?.type}`;
      let dItem = state.data.find(x => x.title = title);
      if (!c.some(x => x.title == title)) {
        c.push({ active: dItem?.active ?? false, data: [v], title: title, lazyLoading: dItem?.lazyLoading ?? true });
      } else c.find(x => x.title == title).data.push(v);
      return c;
    }, [] as CollabsData<Book>[]);
    state.data = data;
  }, [books])

  let screenHeight = (context.size.window.height as number) / 2;


  return (
    <View css="flex ali-center mih:100 invert">

      <Header
        value={state.text}
        inputEnabled={true}
        onInputChange={mem(txt => {
          state.text = txt ?? "";
        })}
      />
      <View css="itemListContainer">
        {
          !state.text.has() ? (
            <ScrollView>
              {mem(state.data.map((x, indx) => (
                <Collabse css={"collabseItem"}
                  style={memKey("CollabseStyle" + indx, { maxHeight: 50 + Math.max(Math.min(screenHeight, x.data.length * 60), 60), padding: 0, marginBottom: 10 }, screenHeight, x.data.length)}
                  icon={memKey("CollabseIcon", <Icon type="AntDesign" name='book' size={20} />)} text={x.title}
                  key={x.title + indx}
                  defaultActive={x.active}
                  lazyLoading={true}
                  onActiveStateChange={memKey("CollabseActiveChange" + indx, c => {
                    x.active = c;
                    x.lazyLoading = false;
                  }, x)}>
                  {
                    <ItemList
                      nested={true}
                      style={memKey("CollabseItemListStyle", { paddingTop: 5, paddingBottom: 5, height: "90%" })}
                      items={x.data}
                      container={memKey("CollabseContainer", ({ item }: any) => (
                        <ItemRender hideParserDetail={true} url={item.url} />
                      ))}
                      itemCss="clearwidth ali:center juc:center mab:5 overflow bor:5 he-60"
                      vMode={true}
                    />
                  }
                </Collabse>

              )), state.data)}</ScrollView>) : (
            <ItemList
              items={mem(books?.filter(x => !state.text.has() || x.name.has(state.text) || x.parserName.has(state.text) || (context.parser.find(x.parserName)?.type ?? "").has(state.text)), state.text)}
              container={mem(({ item }: any) => (
                <ItemRender url={item.url} />
              ))}
              itemCss="clearwidth ali:center juc:center mab:5 overflow bor:5 he-60"
              vMode={true}
            />
          )
        }
        {loader.elem}
      </View>
    </View>
  );
};
