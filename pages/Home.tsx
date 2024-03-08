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
  ActionSheet
} from "../components";
import {
  useState,
  useEffect,
  useRef,
  memo
} from "react";
import g from "../GlobalContext";
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
  const [books, dataIsLoading, reload] = g
    .db()
    .useQuery(
      "Books",
      g
        .db()
        .querySelector<Book>("Books")
        .Where.Column(x => x.url)
        .EqualTo(
          g.appSettings.currentNovel?.url ??
            "hhhh"
        )
        .AND.Column(x => x.parserName)
        .EqualTo(
          g.appSettings.currentNovel
            ?.parserName ?? "gggg"
        )
    );
  useDbHook(
    "AppSettings",
    item => true,
    () => g.appSettings,
    "currentNovel"
  )(() => reload());

  let book = books?.firstOrDefault() ?? {};
  if (!books?.firstOrDefault()) return null;
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
                    g.appSettings.currentNovel
                      ?.isEpub
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
              {g.appSettings.currentNovel
                ?.isEpub &&
              book.parserName != "epub"
                ? ` (Epub)`
                : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            ifTrue={() =>
              g.appSettings.currentNovel
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
              g.appSettings.currentNovel = {};
              g.appSettings.saveChanges();
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
                  g.appSettings.currentNovel
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
              css="header bold pa:4">
              {book.name}
            </Text>
            <Text css="desc bold co:red pal:4">
              {book.parserName.displayName()}
            </Text>
            <Text
              invertColor={true}
              css="desc bold co:red bottom le:35%">
              READING NOW
              {g.appSettings.currentNovel
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
  g.nav = options;
  let groups = g.parser.current().settings.group;
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
          <NovelGroup
            {...props}
            key={i + g.parser.current().name}
            item={x}
            vMode={false}
          />
        ))}
      </ScrollView>
    </View>
  );
};
