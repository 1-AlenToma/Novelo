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
  AnimatedView,
  ActionSheet,
  Form
} from "../components";
import {
  useState,
  useEffect,
  useRef,
  memo
} from "react";
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
  context.hook("theme.settings");
  const [books, dataIsLoading, reload] = context
    .db()
    .useQuery(
      "Books",
      context
        .db()
        .querySelector<Book>("Books")
        .Where.Column(x => x.url)
        .EqualTo(
          context.appSettings.currentNovel?.url ??
            "hhhh"
        )
        .AND.Column(x => x.parserName)
        .EqualTo(
          context.appSettings.currentNovel
            ?.parserName ?? "gggg"
        )
    );
  useDbHook(
    "AppSettings",
    item => true,
    () => context.appSettings,
    "currentNovel"
  )(() => reload());

  let book = books?.firstOrDefault() ?? {};
  if (!books?.firstOrDefault()) return children;
  return (
    <>
      <ActionSheet
        title="Actions"
        onHide={() => setVisible(false)}
        visible={visible}
        height={300}>
        <View>
          <TouchableOpacity
            css="listButton"
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
                  url: book.url,
                  parserName: book.parserName,
                  epub:
                    book.parserName == "epub" ||
                    context.appSettings
                      .currentNovel?.isEpub
                })
                .push();
              setVisible(false);
            }}>
            <Icon
              invertColor={true}
              name="book-reader"
              type="FontAwesome5"
            />
            <Text invertColor={true}>
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
            css="listButton"
            onPress={() => {
              options
                .nav("ReadChapter")
                .add({
                  url: book.url,
                  parserName: book.parserName
                })
                .push();
              setVisible(false);
            }}>
            <Icon
              invertColor={true}
              name="book-reader"
              type="FontAwesome5"
            />
            <Text invertColor={true}>
              Read (Online)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            css="listButton"
            onPress={() => {
              context.appSettings.currentNovel =
                {};
              context.appSettings.saveChanges();
              setVisible(false);
            }}>
            <Icon
              invertColor={true}
              name="notification-clear-all"
              type="MaterialCommunityIcons"
            />
            <Text invertColor={true}>Clear</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
      <AnimatedView
        style={style}
        css="bor:5 overflow ma:5"
        invertColor={true}>
        {children}
        <TouchableOpacity
          css="flex pa:5 row"
          onLongPress={() => setVisible(true)}
          onPress={() => {
            options
              .nav("ReadChapter")
              .add({
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
          <View css="flex">
            <Text
              invertColor={true}
              css="header pa:4">
              {book.name}
            </Text>
            <Text css="desc co:red pal:4">
              {book.parserName.displayName()}
            </Text>
            <Text
              invertColor={true}
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
  context.nav = options;
  let groups =
    context.parser.current().settings.group;
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
        )}>
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
            invertColor={true}
            css="ali:center bor:5 overflow ma:5 pa:5 pab:0"
            key={
              i + context.parser.current().name
            }>
            <NovelGroup
              {...props}
              item={x}
              vMode={false}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
