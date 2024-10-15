import Text from "./ThemeText";
import View from "./ThemeView";
import Icon from "./Icons";
import Slider from "./SliderView";
import AnimatedView from "./AnimatedView";
import TouchableOpacity from "./TouchableOpacityView";

import * as React from "react";
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

export default ({ ...props }: any) => {
  context.hook(
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
    item =>
      item.parent_Id === context.player.book?.id,
    () => context.player.currentChapterSettings,
    "audioProgress"
  );

  context.useEffect(() => {
    if (context.player.hooked && moved.current) {
      animation.resetAnimation();
      moved.current = false;
    }
  }, "player.hooked");
  const audioProgressTimer = useTimer(100);
  if (!context.player || !context.player.book)
    return null;

  const touchThreshold = 20;
  if (!pan.current) {
    pan.current = PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !context.player.hooked,
      onMoveShouldSetPanResponder: (
        e,
        gestureState
      ) => {
        const { dx, dy } = gestureState;
        if (context.player.hooked) return false;
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
        ifTrue={context.player.showPlayer}
        style={[
          {
            top:
              context.player.hooked &&
              context.player.showController &&
              !moved.current
                ? 41
                : 1,
            transform: [
              {
                translateY:
                  animation.y.interpolate({
                    inputRange: [
                      0,
                      context.size.window.height -
                        40
                    ],
                    outputRange: [
                      context.player.hooked
                        ? 0
                        : 41,
                      context.size.window.height -
                        40
                    ],
                    extrapolate: "clamp"
                  })
              }
            ]
          }
        ]}
        css={`band zi:500 bac:black absolute overflow he:40 juc:center ali:center row pal:10 par:10 ${
          context.player.viewState == "Folded"
            ? "wi:40 bor:4 ri:2"
            : !context.player.hooked
            ? "bor:4"
            : `bobw:1 boc:${methods.invertColor(
                context.appSettings
                  .backgroundColor
              )}`
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
              context.player.viewState =
                context.player.viewState ==
                "Folded"
                  ? "Unfolded"
                  : "Folded";
            }}>
            <Icon
              invertColor={true}
              name={
                context.player.viewState ==
                "Folded"
                  ? "menu-unfold"
                  : "menu-fold"
              }
              type="AntDesign"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              context.nav
                .nav("ReadChapter")
                .add({
                  name: context.player.novel.name,
                  url: context.player.novel.url,
                  parserName:
                    context.player.novel
                      .parserName,
                  epub: context.player.isEpup
                })
                .push();
            }}
            css="wi:30"
            ifTrue={
              !context.player.hooked &&
              context.player.viewState !==
                "Folded"
            }>
            <Icon
              invertColor={true}
              type="Octicons"
              name="browser"
            />
          </TouchableOpacity>
          <View
            ifTrue={
              context.player.viewState != "Folded"
            }
            invertColor={false}
            css="wi:40 he:30 juc:center ali:center">
            <Text
              css="bold fos:10 tea:center"
              invertColor={false}>
              {context.player
                .currentChapterSettings
                .audioProgress + 1}
              /
              {context.player.chapterArray.length}
            </Text>
          </View>
          <View
            css="clearheight flex"
            ifTrue={
              context.player.viewState != "Folded"
            }>
            <Slider
              value={
                context.player
                  .currentChapterSettings
                  .audioProgress
              }
              onValueChange={value => {
                audioProgressTimer(async () => {
                  context.player.currentChapterSettings.audioProgress =
                    value;
                  await context.player.currentChapterSettings.saveChanges();
                  if (context.player.playing())
                    context.player.speak();
                });
              }}
              minimumValue={0}
              maximumValue={
                context.player.chapterArray
                  .length - 1
              }
            />
          </View>
          <TouchableOpacity
            ifTrue={
              context.player.viewState != "Folded"
            }
            onPress={() =>
              context.player.playing(
                !context.player.playing()
              )
            }>
            <Icon
              name={
                context.player.playing()
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
              context.player.viewState != "Folded"
            }
            onPress={() =>
              context.player.playPrev()
            }>
            <Icon
              name="play-back-circle"
              size={35}
              type="Ionicons"
              invertColor={true}
            />
          </TouchableOpacity>
          <TouchableOpacity
            ifTrue={
              context.player.viewState != "Folded"
            }
            onPress={() =>
              context.player.playNext()
            }>
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
