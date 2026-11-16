import { View, AnimatedView, Text, TouchableOpacity, Icon, ProgressBar } from "react-native-short-style";
import Slider from "./SliderView";
import * as React from "react";
import useDbHook from "../hooks/useDbHook";
import useTimer from "../hooks/Timer"
import useLoader from "./Loader";
import { SingleTouchableOpacity } from "./SingleTouchableOpacity";
import { PrimitiveObject } from "react-smart-state";

const EmulateTTsLoadingProgress = () => {
  context.hook("tts.loading");

  const targetChars = context.appSettings.ttsTargetChars ?? 300;
  // Optional: if you have the remaining text length available, cap to it
  const remainingChars = context.player.chapterArray.join("").length ?? targetChars;
  const effectiveChars = Math.min(targetChars, Math.max(40, remainingChars));

  // ~1.0s base startup + ~4ms per character in the first batch
  const estimatedMs = 1000 + effectiveChars * 4;
  const tickMs = 500;

  const timer = useTimer(tickMs);
  const elapsedMs = PrimitiveObject(0);


  context.useEffect(() => {
    elapsedMs.value = 0;
  }, "tts.loading");

  if (context.tts.loading) {
    timer(() => {
      if (context.tts.loading) {
        elapsedMs.value += 80;
      }
    });
  }

  // Smooth ease-out curve capped at 92% so it never looks frozen on slower phones
  const rawProgress = 1 - Math.exp((-2.2 * elapsedMs.value) / estimatedMs);
  const clampedValue = Math.min(0.92, Number(rawProgress.toFixed(3)));

  const statusText =
    elapsedMs.value < 900
      ? "Preparing narrator voice..."
      : elapsedMs.value < 3000
        ? "Generating first lines..."
        : "Almost ready, starting playback...";

  return (
    <ProgressBar
      css="_abc he-100% wi-100%"
      ifTrue={context.tts.loading}
      value={clampedValue}
      text={statusText}
    >
      <Text css="fos-12 bold co-#FFFFFF">{statusText}</Text>
    </ProgressBar>
  );
};




export default ({ isMenu }: { isMenu?: boolean }) => {
  const loader = useLoader();
  const { locMem } = useFunc();
  context.hook(
    "player.showController",
    "appSettings.backgroundColor",
    "player.showPlayer",
    "player.chapterArray",
    "player._playing",
    "player.viewState",
    "player",
    "tts.loading",
    "tts.isInitialized",
    "player"
  );

  context.useEffect(() => {
    console.log("tts.initializing", context.tts.isInitialized)
    !context.tts.isInitialized ? loader.show() : loader.hide();
  }, "tts.isInitialized")

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
        locMem<any>({
          zIndex: 100,
          top: context.player.hooked && context.player.showController && !isMenu ? 48 : (isMenu ? 0 : 1),
          position: isMenu ? "relative" : "absolute",
          borderBottomWidth: isMenu ? 0 : 0,
          borderRadius: isMenu ? 0 : 0,
          borderColor: methods.invertColor(context.appSettings.backgroundColor)
        }, isMenu, context.appSettings.backgroundColor, context.player.hooked, context.player.showController)
      }
      css={`band zi:100 bac:black overflow he:40 juc:center ali:center pal:10 par:10 invert`}>
      {loader.elem}
      <EmulateTTsLoadingProgress />
      <View css="row juc:center ali:center di:flex invert">
        <SingleTouchableOpacity
          onPress={locMem(() => {
            context.navigate.read("ReadChapter", {
              name: context.player.novel.name,
              url: context.player.novel.url,
              parserName: context.player.novel.parserName ?? context.player.book.parserName,
              epub: context.player.isEpup
            });
          })}
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
            {(context.player.currentChapterSettings.audioPercent = context.player.chapterArray.length.downloadPercent(context.player.currentChapterSettings.audioProgress)).toFixed(0)}%
          </Text>
        </View>
        <View
          css="clearheight flex invert">
          <Slider
            value={context.player.currentChapterSettings.audioProgress}
            onValueChange={locMem((value: number) => {
              audioProgressTimer(async () => {
                if (context.player.playing())
                  await context.player.playing(false)
                context.player.currentChapterSettings.audioProgress = value;
                context.player.currentPlaying = "";
                await context.player.currentChapterSettings.saveChanges();
              });
            })}
            minimumValue={0}
            maximumValue={context.player.chapterArray.length - 1}
          />
        </View>
        <SingleTouchableOpacity
          isLoading={context.tts.loading}
          onPress={locMem(() =>
            context.player.playing(!context.player.playing())
          )}>
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
          onPress={locMem(async () => {
            if (context.player.playing())
              await context.player.playing(false)
            context.player.playPrev();
          }
          )}>
          <Icon
            name="play-back-circle"
            css="fos-35"
            type="Ionicons"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={locMem(async () => {
            if (context.player.playing())
              await context.player.playing(false)
            context.player.playNext();
          }
          )}>
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
