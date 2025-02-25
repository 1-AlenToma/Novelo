import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Icon,
  NovelGroup,
  AnimatedView,
  ActionSheet,
  AlertDialog,
} from "../components";
import * as React from "react";
import Header from "./Header";
import {
  useNavigation,
  useDbHook
} from "../hooks";
import { Book } from "../db";
import {
  ScrollView,
  Animated
} from "react-native";
const HEADER_EXPANDED_HEIGHT = 190;
const HEADER_COLLAPSED_HEIGHT = 60;
const CurrentItem = ({
  style,
  children,
  ...props
}: any) => {
  const [_, options, navop] =
    useNavigation(props);
  const [visible, setVisible] = useState(false);
  const [books, dataIsLoading, reload] = context.db.useQuery("Books",
    context.db.Books.query.where.column(x => x.url).equalTo(context.appSettings.currentNovel?.url ?? "hhhh").and.column(x => x.parserName).equalTo(context.appSettings.currentNovel?.parserName ?? "gggg")
  );
  useDbHook(
    "AppSettings",
    item => true,
    () => context.appSettings,
    "currentNovel"
  )(() => reload());

  let book: Book = books?.firstOrDefault() ?? {} as any;
  if (!books?.firstOrDefault()) return children;
  return (
    <>
      <ActionSheet
        onHide={() => setVisible(false)}
        isVisible={visible}
        size={300}>
        <View css="invert">
          <Text css="header">Actions</Text>
          <TouchableOpacity
            css="invert listButton"
            ifTrue={() =>
              book.parserName != "epub"
            }
            onPress={() => {
              options
                .nav("NovelItemDetail")
                .add({
                  url: book.url,
                  parserName: book.parserName
                })
                .push();
              setVisible(false);
            }}>
            <Icon
              name="info-circle"
              type="FontAwesome5"
              css="invertco"
            />
            <Text>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            css="invert listButton"
            onPress={() => {
              options
                .nav("ReadChapter")
                .add({
                  name: book.name,
                  url: book.url,
                  parserName: book.parserName,
                  epub: book.parserName == "epub" || context.appSettings.currentNovel?.isEpub
                })
                .push();
              setVisible(false);
            }}>
            <Icon
              name="book-reader"
              type="FontAwesome5"
              css="invertco"
            />
            <Text>
              Read
              {context.appSettings.currentNovel
                ?.isEpub &&
                book.parserName != "epub"
                ? ` (Epub)`
                : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            ifTrue={() =>
              context.appSettings.currentNovel
                ?.isEpub &&
              book.parserName != "epub"
            }
            css="invert listButton"
            onPress={() => {
              options
                .nav("ReadChapter")
                .add({
                  name: book.name,
                  url: book.url,
                  parserName: book.parserName
                })
                .push();
              setVisible(false);
            }}>
            <Icon
              name="book-reader"
              type="FontAwesome5"
              css="invertco"
            />
            <Text>
              Read (Online)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            css="invert listButton"
            onPress={() => {
              context.appSettings.currentNovel = {} as any;
              context.appSettings.saveChanges();
              setVisible(false);
            }}>
            <Icon
              name="notification-clear-all"
              type="MaterialCommunityIcons"
              css="invertco"
            />
            <Text>Clear</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
      <AnimatedView
        style={style}
        css="bor:5 overflow ma:5 invert">
        {children}
        <TouchableOpacity
          css="flex pa:5 row"
          onLongPress={() => setVisible(true)}
          onPress={() => {
            options
              .nav("ReadChapter")
              .add({
                name: book.name,
                url: book.url,
                parserName: book.parserName,
                epub:
                  book.parserName == "epub" ||
                  context.appSettings.currentNovel
                    ?.isEpub
              })
              .push();
          }}>
          <Image
            url={book.imageBase64}
            css="resizeMode:cover bor:5 he:100% wi:110"
          />
          <View css="flex invert">
            <Text
              css="header pa:4">
              {book.name}
            </Text>
            <Text css="desc co:red pal:4">
              {book.parserName.displayName()}
            </Text>
            <Text
              css="desc co:red bottom le:35%">
              READING NOW
              {context.appSettings.currentNovel
                ?.isEpub &&
                book.parserName != "epub"
                ? ` (Epub)`
                : ""}
            </Text>
          </View>
        </TouchableOpacity>
      </AnimatedView>
    </>
  );
};
export default ({ ...props }: any) => {
  const [_, options, navop] =
    useNavigation(props);
  context.hook("size");
  context.nav = options;
  let groups =
    context.parser.current.settings.group;
  let scrollAnimation = useRef(
    new Animated.Value(0)
  ).current;
  const height = scrollAnimation.interpolate({
    inputRange: [
      0,
      HEADER_EXPANDED_HEIGHT -
      HEADER_COLLAPSED_HEIGHT
    ],
    outputRange: [
      HEADER_EXPANDED_HEIGHT,
      HEADER_COLLAPSED_HEIGHT
    ],
    extrapolate: "clamp"
  });
  return (
    <View css="flex ali:flex-start juc:flex-start">
      <ScrollView
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollAnimation
                }
              }
            }
          ],
          { useNativeDriver: false }
        )} style={{ minWidth: context.size.window.width }}>
        <CurrentItem
          style={{ height }}
          {...props}>
          <Header
            {...props}
            inputEnabled={true}
          />
        </CurrentItem>

        {groups.map((x, i) => (
          <View
            css="ali:center bor:5 overflow ma:5 pa:5 pab:0 invert"
            key={
              i + context.parser.current.name
            }>
            <NovelGroup
              {...props}
              itemIndex={i}
              vMode={false}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
