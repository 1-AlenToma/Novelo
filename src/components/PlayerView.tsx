import { View, AnimatedView, Text, TouchableOpacity, Icon } from "react-native-short-style";
import Slider from "./SliderView";
import * as React from "react";
import useDbHook from "../hooks/useDbHook";
import useTimer from "../hooks/Timer"
import useLoader from "./Loader";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";

export default ({ isMenu }: { isMenu?: boolean }) => {
  const loader = useLoader();
  context.hook(
    "player.showController",
    "appSettings",
    "player.showPlayer",
    "player.chapterArray",
    "player._playing",
    "player.viewState",
    "player"
  );

  context.useEffect(() => {
    console.log("tts.initializing")
    context.tts.initializing ? loader.show() : loader.hide();
  }, "tts.initializing")

  const audioProgressTimer = useTimer(100);

  useDbHook(
    "Chapters",
    item =>
      item.parent_Id === context.player.book?.id,
    () => context.player.currentChapterSettings,
    "audioProgress"
  );


  if (!context.player || !context.player.book)
    return null;

  return (
    <View
      ifTrue={context.player.showPlayer}
      style={
        {
          zIndex: 100,
          top: context.player.hooked && context.player.showController && !isMenu ? 48 : (isMenu ? 0 : 1),
          position: isMenu ? "relative" : "absolute",
          borderBottomWidth: isMenu ? 0 : 0,
          borderRadius: isMenu ? 0 : 0,
          borderColor: methods.invertColor(context.appSettings.backgroundColor)
        }
      }
      css={`band zi:100 bac:black overflow he:40 juc:center ali:center pal:10 par:10 invert`}>
      {loader.elem}
      <View css="row juc:center ali:center di:flex invert">
        <SingleTouchableOpacity
          onPress={() => {
            context.nav
              .navigate("ReadChapter", {
                name: context.player.novel.name,
                url: context.player.novel.url,
                parserName: context.player.novel.parserName,
                epub: context.player.isEpup
              });
          }}
          css="wi:30"
          ifTrue={isMenu == true}>
          <Icon
            type="Octicons"
            name="browser"
          />
        </SingleTouchableOpacity>
        <View
          css="wi:50 he:30 invert juc:center ali:center invert">
          <Text css="bold fos:10 tea:center invertco" numberOfLines={1}>
            {context.player.currentChapterSettings.audioProgress + 1}/{context.player.chapterArray.length}
          </Text>
        </View>
        <View
          css="clearheight flex invert">
          <Slider
            value={context.player.currentChapterSettings.audioProgress}
            onValueChange={(value: number) => {
              audioProgressTimer(async () => {
                if (context.player.playing())
                  await context.player.playing(false)
                context.player.currentChapterSettings.audioProgress = value;
                await context.player.currentChapterSettings.saveChanges();
              });
            }}
            minimumValue={0}
            maximumValue={context.player.chapterArray.length - 1}
          />
        </View>
        <SingleTouchableOpacity
          onPress={() =>
            context.player.playing(!context.player.playing())
          }>
          <Icon
            name={context.player._playing
              ? "pause-circle"
              : "play-circle"
            }
            type="Ionicons"
            css="fos-35"
          />
        </SingleTouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (context.player.playing())
              await context.player.playing(false)
            context.player.playPrev();
          }
          }>
          <Icon
            name="play-back-circle"
            css="fos-35"
            type="Ionicons"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (context.player.playing())
              await context.player.playing(false)
            context.player.playNext();
          }
          }>
          <Icon
            name="play-forward-circle"
            css="fos-35"
            type="Ionicons"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
