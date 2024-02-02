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
  AnimatedView
} from "../components";
import {
  useState,
  useEffect,
  useRef,
  memo
} from "react";
import g from "../GlobalContext";
import Header from "./Header";
import { useNavigation } from "../hooks";
import { Book } from "../db";
import {
  ScrollView,
  Animated
} from "react-native";
const HEADER_EXPANDED_HEIGHT = 150;
const HEADER_COLLAPSED_HEIGHT = 60;
const CurrentItem = ({
  style,
  ...props
}: any) => {
  const [_, options, navop] =
    useNavigation(props);
  const [books, dataIsLoading, reload] = g
    .db()
    .useQuery(
      "Books",
      g
        .db()
        .querySelector<Book>("Books")
        .Where.Column(x => x.url)
        .EqualTo(g.appSettings.currentNovel?.url)
        .AND.Column(x => x.parserName)
        .EqualTo(
          g.appSettings.currentNovel?.parserName
        )
    );

  g.subscribe(() => {
    reload();
  }, "appSettings.currentNovel");

  let book = books?.firstOrDefault();
  if (book == undefined || book == null)
    return null;
  return (
    <AnimatedView
      style={style}
      invertColor={true}>
      <TouchableOpacity
        css="flex pa:5 row"
        onPress={() => {
          options
            .nav("ReadChapter")
            .add({
              url: book.url,
              parserName: book.parserName
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
            {book.parserName}
          </Text>
          <Text
            invertColor={true}
            css="desc bold co:red bottom le:35%">
            READING NOW
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedView>
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
      <Header
        {...props}
        inputEnabled={true}
      />

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
          {...props}
        />
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
