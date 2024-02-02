import Text from "./ThemeText";
import View from "./ThemeView";
import Icon from "./Icons";
import Slider from "./SliderView";
import AnimatedView from "./AnimatedView";
import TouchableOpacity from "./TouchableOpacityView";
import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  ScrollView,
  Linking,
  PanResponder,
  Animated
} from "react-native";
import {
  useUpdate,
  useTimer,
  useDbHook
} from "../hooks";
import { useNavigation } from "@react-navigation/native";
import { Player, DetailInfo } from "../native";
import g from "../GlobalContext";

export default ({ ...props }: any) => {
  g.hook(
    "player.showController",
    "appSettings",
    "player.showPlayer",
    "player.chapterArray",
    "player._playing",
    "player.viewState"
  );
  const [animation, setAnimation] = useState(
    new Animated.ValueXY()
  );

  let moved = useRef(false);
  let pan = useRef();
  useDbHook(
    "Chapters",
    item => item.parent_Id === g.player.book?.id,
    () => g.player.currentChapterSettings,
    "audioProgress"
  );

  g.subscribe(() => {
    if (g.player.hooked && moved.current) {
      animation.resetAnimation();
      moved.current = false;
    }
  }, "player.hooked");
  const audioProgressTimer = useTimer(100);
  if (!g.player || !g.player.book) return null;

  const touchThreshold = 20;
  if (!pan.current) {
    pan.current = PanResponder.create({
      onStartShouldSetPanResponder: () => !g.player.hooked,
      onMoveShouldSetPanResponder: (
        e,
        gestureState
      ) => {
        const { dx, dy } = gestureState;
        if(g.player.hooked)
           return false;
        return (
          Math.abs(dx) > touchThreshold ||
          Math.abs(dy) > touchThreshold
        );
      },
      onShouldBlockNativeResponder: () => false,
      onPanResponderGrant: () => {
        animation.setOffset({
          x: animation.x._value,
          y: animation.y._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: animation.x, dy: animation.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        animation.flattenOffset();
        moved.current = true;
      } //Step 4
    });
  }

  return (
    <>
      <AnimatedView
        ifTrue={g.player.showPlayer}
        style={[
          {
            top:
              g.player.hooked &&
              g.player.showController &&
              !moved.current
                ? 41
                : 1,
            transform: [
              {
                translateY:
                  animation.y.interpolate({
                    inputRange: [
                      0,
                      g.size.window.height - 40
                    ],
                    outputRange: [
                      g.player.hooked ?0:41,
                      g.size.window.height - 40
                    ],
                    extrapolate: "clamp"
                  })
              }
            ]
          }
        ]}
        css={`band zi:500 bac:black absolute overflow he:40 juc:center ali:center row pal:10 par:10 ${
          g.player.viewState == "Folded"
            ? "wi:40 bor:4 ri:2"
            : !g.player.hooked
            ? "bor:4"
            : ""
        }`}
        {...pan.current.panHandlers}
        invertColor={true}>
        <View css="row jus:center ali:center di:flex">
          <TouchableOpacity
            onStartShouldSetResponderCapture={() =>
              false
            }
            css="wi:30"
            onPress={() => {
              g.player.viewState =
                g.player.viewState == "Folded"
                  ? "Unfolded"
                  : "Folded";
            }}>
            <Icon
              invertColor={true}
              name={
                g.player.viewState == "Folded"
                  ? "menu-unfold"
                  : "menu-fold"
              }
              type="AntDesign"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              g.nav
                .nav("ReadChapter")
                .add({
                  url: g.player.novel.url,
                  parserName:
                    g.player.novel.parserName
                })
                .push();
            }}
            css="wi:30"
            ifTrue={
              !g.player.hooked &&
              g.player.viewState !== "Folded"
            }>
            <Icon
              invertColor={true}
              type="Octicons"
              name="browser"
            />
          </TouchableOpacity>
          <View
            ifTrue={
              g.player.viewState != "Folded"
            }
            invertColor={false}
            css="wi:40 he:30 juc:center ali:center">
            <Text
              css="bold fos:10 tea:center"
              invertColor={false}>
              {g.player.currentChapterSettings
                .audioProgress + 1}
              /{g.player.chapterArray.length}
            </Text>
          </View>
          <View
            css="clearheight flex"
            ifTrue={
              g.player.viewState != "Folded"
            }>
            <Slider
              value={
                g.player.currentChapterSettings
                  .audioProgress
              }
              onValueChange={value => {
                audioProgressTimer(async () => {
                  g.player.currentChapterSettings.audioProgress =
                    value;
                  await g.player.currentChapterSettings.saveChanges();
                  if (g.player.playing())
                    g.player.speak();
                });
              }}
              minimumValue={0}
              maximumValue={
                g.player.chapterArray.length - 1
              }
            />
          </View>
          <TouchableOpacity
            ifTrue={
              g.player.viewState != "Folded"
            }
            onPress={() =>
              g.player.playing(
                !g.player.playing()
              )
            }>
            <Icon
              name={
                g.player.playing()
                  ? "pause-circle"
                  : "play-circle"
              }
              type="Ionicons"
              size={35}
              invertColor={true}
            />
          </TouchableOpacity>
          <TouchableOpacity
            ifTrue={
              g.player.viewState != "Folded"
            }
            onPress={() => g.player.playPrev()}>
            <Icon
              name="play-back-circle"
              size={35}
              type="Ionicons"
              invertColor={true}
            />
          </TouchableOpacity>
          <TouchableOpacity
            ifTrue={
              g.player.viewState != "Folded"
            }
            onPress={() => g.player.playNext()}>
            <Icon
              name="play-forward-circle"
              size={35}
              type="Ionicons"
              invertColor={true}
            />
          </TouchableOpacity>
        </View>
      </AnimatedView>
    </>
  );
};
