import Text from "./ThemeText";
import View from "./ThemeView";
import Icon from "./Icons";
import Slider from "./SliderView";
import TouchableOpacity from "./TouchableOpacityView";
import { useEffect, useRef } from "react";
import {
  ScrollView,
  Linking
} from "react-native";
import {
  useUpdate,
  useTimer,
  useDbHook
} from "../hooks";
import { useNavigation } from "@react-navigation/native";
import {
  useState,
  Player,
  DetailInfo
} from "../native";
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
  useDbHook(
    "Chapters",
    item => item.parent_Id === g.player.book?.id,
    () => g.player.currentChapterSettings,
    "audioProgress"
  );
  const audioProgressTimer = useTimer(100);
  if (!g.player || !g.player.book) return null;

  return (
    <>
      <View
        ifTrue={g.player.showPlayer}
        style={[
          g.player.hooked
            ? {
                top: g.player.showController
                  ? 41
                  : 1
              }
            : {}
        ]}
        css={`band absolute overflow he:40 juc:center ali:center row pal:10 par:10 ${
          g.player.viewState == "Folded"
            ? "wi:40 ri:2 mat:30 bor:4 bo:45"
            : !g.player.hooked
            ? "bor:4 bo:45"
            : ""
        }`}
        invertColor={true}>
        <View css="row jus:center ali:center di:flex">
          <TouchableOpacity
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
              g.nav.nav("ReadChapter")
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
      </View>
    </>
  );
};
