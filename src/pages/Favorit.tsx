import {
  Text,
  View,
  useLoader,
  Image,
  ItemList,
  Icon,
  FoldableItem,
  AlertDialog
} from "../components";
import * as React from "react";
import Header from "./Header";
import {
  useNavigation
} from "../hooks";
import { Book } from "db";

const ItemRender = ({
  item,
  state,
  loader
}: {
  item: Book,
  state: any,
  loader: any
}) => {
  const itemLoader = useLoader(false)
  context.hook("novelFavoritInfo");
  const [books, dataIsLoading] = context.db.Books.useQuery(
    context.db.Books.query.load("chapterSettings").where.column(x => x.url).equalTo(item.url),
    (items, op) => {
      return (items.find(x => x.url == item.url && x.favorit) != undefined);
    }
  );

  context.cache.onDirDelete((parserName) => {
    if (!parserName || parserName == item.parserName)
      loadNovelDetail();
  });

  const loadNovelDetail = async (refresh?: boolean) => {
    itemLoader.show();
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
  }

  useEffect(() => {
    loadNovelDetail();
  }, [books]);

  context.useEffect(() => loadNovelDetail(), "parser.all")

  item = books.find(x => x.url === item.url) ?? item;

  return (
    <>
      {itemLoader.elem}

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
                      let file = context.files.exists("".fileName(item.name, item.parserName));
                      if (file) {
                        item.favorit = false;
                        await item.saveChanges();
                      } else await context.db.deleteBook(item.id);
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
        ]}>
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
          <Text css="clearwidth desc fow-bold fos-12 co:red bottom bo:5 le:60">
            ({item.parserName} | {context.parser.find(item.parserName)?.type})
          </Text>
        </View>
      </FoldableItem>
    </>
  );
};

export default ({ ...props }: any) => {
  const state = buildState(() =>
  ({
    text: "",
    json: "",
    infoNovel: {}
  })).build();

  const [books, dataIsLoading, reload] = context
    .db.useQuery(
      "Books",
      context.db.Books.query.load("chapterSettings").where.column(x => x.favorit).equalTo(true),
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
    <View css="flex ali-center mih:100 invert">

      <Header
        value={state.text}
        inputEnabled={true}
        onInputChange={txt => {
          state.text = txt ?? "";
        }}
      />
      <View css="itemListContainer">
        <ItemList
          items={books?.filter(x =>
            !state.text.has() || x.name.has(state.text) || x.parserName.has(state.text) || (context.parser.find(x.parserName)?.type ?? "").has(state.text)
          )}
          container={({ item }) => (
            <ItemRender
              loader={loader}
              state={state}
              item={item}
            />
          )}
          itemCss="clearwidth ali:center juc:center mab:5 overflow bor:5"
          vMode={true}
        />
        {loader.elem}
      </View>
    </View>
  );
};
