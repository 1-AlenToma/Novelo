import {
  Text,
  View,
  TouchableOpacity,
  useLoader,
  Image,
  ItemList,
  Icon,
  NovelGroup,
  FText,
  TextInput,
  SizeAnimator,
  ActionSheet,
  ActionSheetButton,
  Web,
  TabBar,
  Slider,
  CheckBox,
  Modal,
  DropdownList,
  ColorPicker,
  Form,
  ChapterView,
  ButtonList
} from "../../components/";
import WebView from "react-native-webview";
import Fonts from "../../assets/Fonts";
import * as React from "react";
import translate from "translate-google-api";
import { LANGUAGE_TABLE } from "react-native-translator/dist/utils/languageCodeConverter";
import { ScrollView, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useNavigation, useUpdate, useTimer, useDbHook, ChapterProcess } from "../../hooks";
import { Player, DetailInfo } from "../../native";
import Header from "../../pages/Header";
import { Book, Chapter } from "../../db";
import { arrayBuffer, newId, proc, invertColor, sleep } from "../../Methods";
import { useKeepAwake } from "expo-keep-awake";
const lang = {};

for (let l in LANGUAGE_TABLE) {
  let item = LANGUAGE_TABLE[l].google;
  if (item) {
    lang[item.toLowerCase()] = l;
    lang[item.safeSplit("-", -1).toLowerCase()] = l;
  }
}

const Modoles = () => {
  const loader = useLoader();
  context.hook(
    "player.menuOptions",
    "player.menuOptions.textToTranslate",
    "player.menuOptions.textEdit",
    "player.menuOptions.comment",
    "player.menuOptions.define",
    "appSettings"
  );

  useEffect(() => {
    context.player.hide();
    context.player.loader = {
      show: () => {
        loader.show();
        context.player.isloading = true;
      },
      hide: () => {
        loader.hide();
        context.player.isloading = false;
      }
    };
  }, []);

  return (
    <>
      {loader.elem}
      <Modal
        blur={false}
        visible={context.player.menuOptions.comment != undefined}
        onHide={() => (context.player.menuOptions.comment = undefined)}
        height={200}
      >
        <View css="flex mat:20">
          <TextInput
            onChangeText={x =>
              (context.player.menuOptions.comment = x)
            }
            readOnly={true}
            invertColor={false}
            css="pa:5 bor:2 flg:1 clearboth"
            multiline={true}
            defaultValue={context.player.menuOptions.comment}
          />
        </View>
      </Modal>
      <Modal
        blur={false}
        visible={context.player.menuOptions.textEdit != undefined}
        onHide={() => (context.player.menuOptions.textEdit = undefined)}
        height="90"
      >
        <ScrollView>
          <View css="flex mat:20">
            <Form
              root={true}
              text="TextToEdit"
              css="formRow he:100"
            >
              <TextInput
                onChangeText={x =>
                (context.player.menuOptions.textEdit.edit =
                  x)
                }
                invertColor={false}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  context.player.menuOptions.textEdit?.edit
                }
              />
            </Form>
            <Form root={true} text="EditWith" css="formRow he:100">
              <TextInput
                onChangeText={x =>
                (context.player.menuOptions.textEdit.editWith =
                  x)
                }
                invertColor={false}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  context.player.menuOptions.textEdit
                    ?.editWith
                }
              />
            </Form>
            <Form root={true} text="Comment" css="formRow he:100">
              <TextInput
                onChangeText={x =>
                (context.player.menuOptions.textEdit.comments =
                  x)
                }
                invertColor={false}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  context.player.menuOptions.textEdit
                    ?.comments
                }
              />
            </Form>
            <Form text="BackgroundColor">
              <ColorPicker
                value={
                  context.player.menuOptions.textEdit
                    ?.bgColor ?? "#ffffff"
                }
                onComplete={({ hex }) =>
                (context.player.menuOptions.textEdit = {
                  ...context.player.menuOptions.textEdit,
                  bgColor: hex
                })
                }
              />
            </Form>
            <TouchableOpacity
              onPress={async () => {
                context.player.book.textReplacements.push(
                  context.player.menuOptions.textEdit
                );
                await context.player.book.saveChanges();
                await context.player.clean();
                context.player.menuOptions.textEdit = undefined;
              }}
              css="button clearwidth bow:1 boc:#ccc bor:5 juc:center"
            >
              <Text invertColor={true}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      <Modal
        blur={false}
        visible={
          context.player.menuOptions.textToTranslate != undefined
        }
        onHide={() =>
          (context.player.menuOptions.textToTranslate = undefined)
        }
        height="100"
      >
        <View css="flex mat:20">
          <View css="form">
            <Text invertColor={true}>TranslateTo:</Text>
            <DropdownList
              height="80"
              toTop={true}
              items={Object.keys(LANGUAGE_TABLE)}
              render={item => {
                return (
                  <Text css="desc fos:13" invertColor={true}>
                    {item}
                  </Text>
                );
              }}
              onSelect={language => {
                context.appSettings.lang = language;
                context.appSettings.saveChanges();
              }}
              selectedValue={
                context.appSettings.lang ?? "English"
              }
            />
          </View>
          <View css="form flex">
            <WebView
              injectedJavaScript={`
               let items =[... document.querySelectorAll("header, .header, .translate-button-container, .languages-container, .links-container")]
               items.forEach(x=> x.remove())
               //alert(items.length)
              `}
              nestedScrollEnabled={true}
              cacheEnabled={true}
              source={{
                uri: `https://translate.google.com/m?hl=en&sl=en&tl=${LANGUAGE_TABLE[
                  context.appSettings.lang ?? "English"
                ].google
                  }&ie=UTF-8&prev=_m&q=${encodeURIComponent(
                    context.player.menuOptions.textToTranslate
                  )}`
              }}
              contentMode="mobile"
              scalesPageToFit={true}
              originWhitelist={["*"]}
              scrollEnabled={true}
              userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
              setSupportMultipleWindows={false}
              style={[
                {
                  flexGrow: 1,
                  zIndex: 70,
                  flex: 1
                }
              ]}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              javaScriptEnabled={true}
            />
          </View>
        </View>
      </Modal>

      <Modal
        blur={false}
        visible={context.player.menuOptions.define != undefined}
        onHide={() => (context.player.menuOptions.define = undefined)}
        height="100"
      >
        <View css="flex mat:20">
          <View css="form flex">
            <WebView
              nestedScrollEnabled={true}
              cacheEnabled={true}
              source={{
                uri: context.player.menuOptions.define
              }}
              contentMode="mobile"
              scalesPageToFit={true}
              originWhitelist={["*"]}
              scrollEnabled={true}
              userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
              setSupportMultipleWindows={false}
              style={[
                {
                  flexGrow: 1,
                  zIndex: 70,
                  flex: 1
                }
              ]}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              javaScriptEnabled={true}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const Controller = ({ state, ...props }) => {
  useDbHook(
    "Chapters",
    item => item.parent_Id === state.book.id,
    () => context.player.currentChapterSettings,
    "audioProgress"
  );

  context.hook(
    "player.showController",
    "player.showPlayer",
    "player.chapterArray",
    "player.currentChapter",
    "player._playing",
    "size",
    "appSettings"
  );

  const Timer = useTimer(100);
  const audioProgressTimer = useTimer(100);
  const thisState = buildState({
    cText: "",
    chapterSliderValue: undefined
  }).build();

  useEffect(() => {
    if (context.appSettings.lockScreen) context.orientation("LANDSCAPE");

    return () => {
      context.orientation("Default");
    };
  }, []);

  const editSettings = ({
    lineHeight,
    fontSize,
    fontName,
    isBold,
    backgroundColor,
    textAlign,
    lockScreen,
    voice,
    pitch,
    rate,
    margin,
    navigationType,
    use3D,
    fontStyle,
    shadowLength,
    voiceWordSelectionsSettings,
    useSentenceBuilder,
    sentenceMargin
  }: any) => {
    Timer(async () => {
      if (fontSize != undefined) {
        context.appSettings.fontSize = fontSize;
        context.appSettings.lineHeight = fontSize * context.lineHeight;
      }

      if (lineHeight !== undefined) {
        context.appSettings.lineHeight = lineHeight;
      }

      if (isBold != undefined) {
        context.appSettings.isBold = isBold;
      }
      if (backgroundColor !== undefined)
        context.appSettings.backgroundColor = backgroundColor;
      if (textAlign != undefined)
        context.appSettings.textAlign = textAlign;
      if (lockScreen != undefined) {
        context.appSettings.lockScreen = lockScreen;
        if (context.appSettings.lockScreen)
          context.orientation("LANDSCAPE");
        else context.orientation("Default");
      }
      if (rate != undefined) context.appSettings.rate = rate;
      if (pitch != undefined) context.appSettings.pitch = pitch;
      if (fontName) context.appSettings.fontName = fontName;
      if (voice) context.appSettings.voice = voice;
      if (margin != undefined) context.appSettings.margin = margin;
      if (navigationType != undefined)
        context.appSettings.navigationType = navigationType;
      if (use3D != undefined) context.appSettings.use3D = use3D;
      if (fontStyle != undefined)
        context.appSettings.fontStyle = fontStyle;
      if (shadowLength != undefined)
        context.appSettings.shadowLength = shadowLength;
      if (voiceWordSelectionsSettings)
        context.appSettings.voiceWordSelectionsSettings =
          voiceWordSelectionsSettings;
      if (useSentenceBuilder) {
        context.appSettings.useSentenceBuilder = useSentenceBuilder;
      }

      if (sentenceMargin){
        context.appSettings.sentenceMargin = sentenceMargin;
      }
      await context.appSettings.saveChanges();

      if (useSentenceBuilder) context.player.clean();
    });
  };

  return (
    <>
      <View
        ifTrue={context.player.showController}
        css={`band he:110 bottom juc:center ali:center pal:10 par:10 botw:1 boc:${invertColor(
          context.appSettings.backgroundColor
        )}`}
        invertColor={true}
      >
        <Text invertColor={true} css="desc fos:13">
          {context.player.procent(thisState.chapterSliderValue)}
        </Text>
        <View css="clearwidth juc:center ali:center">
          <Slider
            invertColor={true}
            buttons={true}
            disableTimer={true}
            value={context.player.currentChapterIndex}
            onValueChange={v => {
              thisState.chapterSliderValue = v;
            }}
            onSlidingComplete={index => {
              Timer(() => {
                context.player.jumpTo(index);
                thisState.chapterSliderValue = undefined;
              });
            }}
            minimumValue={0}
            maximumValue={context.player.novel.chapters.length - 1}
          />
        </View>
        <View css="clearwidth ali:center juc:center ">
          <Text
            numberOfLines={1}
            invertColor={true}
            css="header bold fos:18 foso:italic"
          >
            {state.book.name}
          </Text>
          <Text numberOfLines={1} css="desc color:red">
            {context.player.currentChapterSettings?.name}
          </Text>
        </View>
      </View>
      <Header
        ifTrue={context.player.showController}
        css={`absolute to:0 bobw:1 boc:${invertColor(
          context.appSettings.backgroundColor
        )}`}
        buttons={[
          {
            ifTrue: !(context.player.novel.type?.isManga() ?? false),
            text: (
              <Icon
                invertColor={true}
                name="featured-play-list"
                type="MaterialIcons"
              />
            ),
            press: () => {
              context.player.playing(false);
              context.player.showPlayer =
                !context.player.showPlayer;
            }
          },
          {
            text: (
              <ActionSheetButton
                title="Chapters"
                height="95"
                btn={
                  <Icon
                    invertColor={true}
                    type="MaterialCommunityIcons"
                    name="menu"
                  />
                }
              >
                <ChapterView
                  book={state.book}
                  novel={state.novel}
                  onPress={item => {
                    context.player.jumpTo(item.url);
                  }}
                  current={context.player.currentChapter.url}
                />
              </ActionSheetButton>
            )
          },
          {
            text: () => (
              <ActionSheetButton
                height="99%"
                btn={
                  <Icon
                    invertColor={true}
                    type="Ionicons"
                    name="settings"
                  />
                }
              >
                <View css="flex">
                  <TabBar
                    loadAll={false}
                    fontSize={14}
                    scrollableHeader={true}
                    scrollHeight="90%"
                    position="Top"
                  >
                    <View
                      icon={{
                        name: "format-font",
                        type: "MaterialCommunityIcons"
                      }}
                      css="flex"
                    >
                      <CheckBox
                        text="LockScreen:"
                        css="pal:1"
                        invertColor={true}
                        checked={
                          context.appSettings
                            .lockScreen
                        }
                        onChange={() => {
                          editSettings({
                            lockScreen:
                              !context.appSettings
                                .lockScreen
                          });
                        }}
                      />
                      <Form text="NavigationMethod">
                        <ButtonList
                          items={["Scroll", "Snap"]}
                          onPress={navigationType => {
                            editSettings({
                              navigationType
                            });
                          }}
                          value={
                            context.appSettings
                              .navigationType
                          }
                        />
                      </Form>
                      <Form text="FontStyle" ifTrue={() => !(state.novel.type?.isManga())}>
                        <ButtonList
                          items={[
                            "normal",
                            "italic",
                            "oblique"
                          ]}
                          onPress={fontStyle => {
                            editSettings({
                              fontStyle
                            });
                          }}
                          value={(
                            context.appSettings
                              .fontStyle ||
                            "normal"
                          ).displayName()}
                        />
                      </Form>
                      <Form text="Background">
                        <ColorPicker
                          value={
                            context.appSettings
                              .backgroundColor
                          }
                          onComplete={({ hex }) =>
                            editSettings({
                              backgroundColor: hex
                            })
                          }
                        />
                      </Form>
                      <Form css="row" text="TextAlign" ifTrue={() => !(state.novel.type?.isManga())}>
                        {[
                          "align-left",
                          "align-center",
                          "align-justify",
                          "align-right"
                        ].map((x, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              editSettings({
                                textAlign:
                                  x.safeSplit(
                                    "-",
                                    1
                                  )
                              });
                            }}
                            css="mar:5"
                          >
                            <Icon
                              type="Feather"
                              name={x}
                              size={30}
                              style={{
                                ...(x.has(
                                  context
                                    .appSettings
                                    .textAlign
                                )
                                  ? {
                                    color: "red"
                                  }
                                  : {})
                              }}
                              invertColor={true}
                            />
                          </TouchableOpacity>
                        ))}
                      </Form>
                      <Form text="Font" ifTrue={() => !(state.novel.type?.isManga())}>
                        <DropdownList
                          height="80"
                          toTop={true}
                          selectedIndex={Object.keys(
                            Fonts
                          ).findIndex(
                            x =>
                              x ==
                              context.appSettings
                                .fontName
                          )}
                          updater={[
                            context.appSettings
                              .fontName
                          ]}
                          hooks={[
                            "appSettings.fontName"
                          ]}
                          items={Object.keys(Fonts)}
                          render={item => {
                            return (
                              <View
                                css={`
                                                                    ${item ==
                                    context
                                      .appSettings
                                      .fontName
                                    ? "selectedRow"
                                    : ""} ali:center pal:10 bor:5 flex row juc:space-between mih:24
                                                                `}
                              >
                                <Text
                                  style={{
                                    fontFamily:
                                      item
                                  }}
                                  css={`
                                      header
                                  `}
                                  invertColor={
                                    true
                                  }
                                >
                                  {item}
                                </Text>
                              </View>
                            );
                          }}
                          onSelect={fontName => {
                            editSettings({
                              fontName
                            });
                          }}
                          selectedValue={
                            context.appSettings
                              .fontName ||
                            "SourceSans3-Black"
                          }
                        />
                      </Form>
                      <Form text="FontSize" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .fontSize
                          }
                          onSlidingComplete={fontSize => {
                            editSettings({
                              fontSize
                            });
                          }}
                          minimumValue={10}
                          maximumValue={40}
                        />
                      </Form>

                      <Form text="LineHeight" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .lineHeight
                          }
                          onSlidingComplete={lineHeight => {
                            editSettings({
                              lineHeight
                            });
                          }}
                          minimumValue={(context.appSettings.fontSize * context.lineHeight) - 8}
                          maximumValue={(context.appSettings.fontSize * context.lineHeight) + 20}
                        />
                      </Form>

                      <Form text="Sentence Margin" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .sentenceMargin ?? 5
                          }
                          onSlidingComplete={sentenceMargin => {
                            editSettings({
                              sentenceMargin
                            });
                          }}
                          minimumValue={5}
                          maximumValue={15}
                        />
                      </Form>

                      <Form text="Padding" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .margin
                          }
                          onSlidingComplete={margin => {
                            editSettings({
                              margin
                            });
                          }}
                          minimumValue={5}
                          maximumValue={40}
                        />
                      </Form>
                    </View>
                    <View
                      ifTrue={() => !(state.novel.type?.isManga())}
                      css="flex"
                      icon={{
                        name: "text-fields",
                        type: "MaterialIcons"
                      }}
                    >
                      <Text
                        ifTrue={() =>
                          context.player.book
                            .parserName !== "epub"
                        }
                        invertColor={true}
                        css="desc fos:10"
                      >
                        Enabling This Option Will Make
                        Novelo Try and Reorder the
                        Sentences of The Chapter Too
                        Follow A Specific novelo Rules,
                        Making the Chapter More
                        Readiable. Offcourse this COULD
                        ALSO MAKE SMALL Mistakes
                        Depending on How The Auther
                        wrote it.
                      </Text>
                      <CheckBox
                        ifTrue={() =>
                          context.player.book
                            .parserName !== "epub"
                        }
                        text="UseSentenceBuilder:"
                        css="pal:1"
                        invertColor={true}
                        checked={
                          context.appSettings
                            .useSentenceBuilder
                            ?.enabled ?? false
                        }
                        onChange={() => {
                          editSettings({
                            useSentenceBuilder: {
                              ...(context
                                .appSettings
                                .useSentenceBuilder ??
                                {}),
                              enabled: !(
                                context
                                  .appSettings
                                  .useSentenceBuilder
                                  ?.enabled ??
                                false
                              )
                            }
                          });
                        }}
                      >
                        <Form
                          text="MinLength"
                          ifTrue={() =>
                            context.appSettings
                              .useSentenceBuilder
                              ?.enabled == true
                          }
                        >
                          <Slider
                            step={10}
                            css="flex"
                            renderValue={true}
                            invertColor={true}
                            buttons={true}
                            value={
                              context.appSettings
                                .useSentenceBuilder
                                ?.minLength ??
                              100
                            }
                            onSlidingComplete={length => {
                              editSettings({
                                useSentenceBuilder:
                                {
                                  ...(context
                                    .appSettings
                                    .useSentenceBuilder ??
                                    {}),
                                  minLength:
                                    length
                                }
                              });
                            }}
                            minimumValue={100}
                            maximumValue={400}
                          />
                        </Form>
                      </CheckBox>
                      <CheckBox
                        text="Add Shadow:"
                        css="pal:1"
                        invertColor={true}
                        checked={
                          context.appSettings.use3D
                        }
                        onChange={() => {
                          editSettings({
                            use3D: !context
                              .appSettings.use3D
                          });
                        }}
                      >
                        <Form
                          text="Shadow Length"
                          ifTrue={() =>
                            context.appSettings
                              .use3D == true
                          }
                        >
                          <Slider
                            css="flex"
                            renderValue={true}
                            invertColor={true}
                            buttons={true}
                            value={(1).sureValue(
                              context.appSettings
                                .shadowLength,
                              true
                            )}
                            onSlidingComplete={shadowLength => {
                              editSettings({
                                shadowLength
                              });
                            }}
                            minimumValue={1}
                            maximumValue={3}
                          />
                        </Form>
                      </CheckBox>
                      <Form
                        css="form he:200"
                        text="InlineStyle"
                      >
                        <TextInput
                          isModole={true}
                          invertColor={false}
                          css="wi:100% pa:5 bor:2 he:100%"
                          multiline={true}
                          defaultValue={
                            context.player.book
                              .inlineStyle
                          }
                          onChangeText={t => {
                            context.player.book.inlineStyle =
                              t;
                            context.player.book.saveChanges();
                          }}
                        />
                      </Form>
                    </View>
                    <View
                      ifTrue={() => !(state.novel.type?.isManga())}
                      css="flex"
                      icon={{
                        name: "settings-voice",
                        type: "MaterialIcons"
                      }}
                    >
                      <Form text="Voices">
                        <DropdownList
                          height="80"
                          toTop={true}
                          updater={[
                            context.player.testVoice
                          ]}
                          hooks={["player.testVoice"]}
                          items={context.voices}
                          onSearch={(item, txt) => {
                            let l =
                              lang[
                              item.language.toLowerCase()
                              ] ||
                              lang[
                              item.language
                                .safeSplit(
                                  "-",
                                  0
                                )
                                .toLowerCase()
                              ] ||
                              item.language;
                            return l.has(txt);
                          }}
                          selectedIndex={context.voices?.findIndex(
                            x =>
                              x.name ==
                              context.appSettings
                                .voice
                          )}
                          render={item => {
                            return (
                              <View
                                css={`
                                                                    ${item.name ==
                                    context
                                      .appSettings
                                      .voice
                                    ? "selectedRow"
                                    : ""} ali:center pal:10 bor:5 flex row juc:space-between
                                                                `}
                              >
                                <Text
                                  css={`desc fos:13`}
                                  invertColor={
                                    true
                                  }
                                >
                                  {lang[
                                    item.language.toLowerCase()
                                  ] ||
                                    lang[
                                    item.language
                                      .safeSplit(
                                        "-",
                                        0
                                      )
                                      .toLowerCase()
                                    ] ||
                                    item.language}
                                  (
                                  {
                                    item.language
                                  }
                                  )
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    context.player.testPlaying(
                                      item.name
                                    )
                                  }
                                >
                                  <Icon
                                    name={
                                      context
                                        .player
                                        .testVoice ==
                                        item.name
                                        ? "stop-circle"
                                        : "play-circle"
                                    }
                                    type="Ionicons"
                                    size={
                                      35
                                    }
                                    invertColor={
                                      true
                                    }
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          }}
                          onSelect={voice => {
                            editSettings({
                              voice: voice.name
                            });
                          }}
                          selectedValue={
                            context.appSettings
                              .voice ?? ""
                          }
                        />
                      </Form>
                      <Form text="Pitch">
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          step={0.1}
                          value={
                            context.appSettings
                              .pitch
                          }
                          onSlidingComplete={pitch => {
                            editSettings({
                              pitch
                            });
                          }}
                          minimumValue={0.9}
                          maximumValue={3}
                        />
                      </Form>
                      <Form text="Rate">
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          step={0.1}
                          value={
                            context.appSettings.rate
                          }
                          onSlidingComplete={rate => {
                            editSettings({
                              rate
                            });
                          }}
                          minimumValue={0.9}
                          maximumValue={3}
                        />
                      </Form>
                      <Form
                        css="mah:200"
                        root={true}
                        text="Words Highlight Settings"
                      >
                        <Form
                          root={true}
                          css="he:80 clearwidth"
                          text="Color"
                        >
                          <ColorPicker
                            value={
                              context.appSettings
                                .voiceWordSelectionsSettings
                                ?.color
                            }
                            onComplete={({ hex }) =>
                              editSettings({
                                voiceWordSelectionsSettings:
                                {
                                  color: hex,
                                  appendSelection:
                                    context
                                      .appSettings
                                      .voiceWordSelectionsSettings
                                      ?.appendSelection
                                }
                              })
                            }
                          />
                        </Form>
                        <CheckBox
                          text="Only Word:"
                          css="pal:1"
                          invertColor={true}
                          checked={
                            context.appSettings
                              .voiceWordSelectionsSettings
                              ?.appendSelection ??
                            false
                          }
                          onChange={() => {
                            editSettings({
                              voiceWordSelectionsSettings:
                              {
                                color: context
                                  .appSettings
                                  .voiceWordSelectionsSettings
                                  ?.color,
                                appendSelection:
                                  !(
                                    context
                                      .appSettings
                                      .voiceWordSelectionsSettings
                                      ?.appendSelection ??
                                    false
                                  )
                              }
                            });
                          }}
                        />
                      </Form>
                    </View>
                    <View
                      ifTrue={() => !(state.novel.type?.isManga())}
                      css="flex"
                      icon={{
                        name: "format-color-highlight",
                        type: "MaterialCommunityIcons"
                      }}
                    >
                      <View css="flex clearboth juc:flex-start mih:100">
                        <Text
                          invertColor={true}
                          css="header fos:18"
                        >
                          Text Replacements
                        </Text>
                        <ItemList
                          items={
                            context.player.book
                              .textReplacements
                          }
                          container={({ item }) => (
                            <View
                              style={{
                                backgroundColor:
                                  item.bgColor
                              }}
                              css="flex di:flex row juc:space-between ali:center pal:10 bor:2"
                            >
                              <View css="flex overflow maw:80%">
                                <Text
                                  css="desc fos:13"
                                  invertColor={
                                    true
                                  }
                                >
                                  {item.edit}
                                  {"\n=>"}
                                </Text>
                                <Text
                                  css="desc fos:13"
                                  invertColor={
                                    true
                                  }
                                >
                                  {
                                    item.editWith
                                  }
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={async () => {
                                  context.player.book.textReplacements =
                                    context.player.book.textReplacements.filter(
                                      x =>
                                        x !=
                                        item
                                    );

                                  await context.player.book.saveChanges();
                                  await context.player.clean();
                                }}
                                css="button"
                              >
                                <Text
                                  invertColor={
                                    true
                                  }
                                >
                                  Delete
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          itemCss="pa:5 clearwidth bobw:1 boc:gray"
                          vMode={true}
                        />
                      </View>
                    </View>
                  </TabBar>
                </View>
              </ActionSheetButton>
            )
          }
        ]}
        {...props}
      />
    </>
  );
};
const InternalWeb = ({ state, ...props }: any) => {
  const chState = ChapterProcess();

  return chState.loading ? chState.web : (
    <Web
      click={() => {
        context.player.showController = !context.player.showController;
      }}
      onComments={index => {
        context.player.menuOptions.comment =
          context.player.book.textReplacements[index].comments;
      }}
      onMenu={(item: any) => {
        // handle later
        if (item.item.text == "Translate")
          context.player.menuOptions.textToTranslate = item.selection;
        else if (item.item.text === "Copy") {
          Clipboard.setStringAsync(item.selection);
        } else if (item.item.text === "Define") {
          context.player.menuOptions.define = `https://www.google.com/search?q=define%3A${item.selection.replace(
            / /g,
            "+"
          )}&sca_esv=ae00ca4afbc9d4da&sxsrf=ACQVn09Tncl4Kw9jpIkzEAaZtuZjWgKj5Q%3A1708602991908&ei=bzbXZcP_Ns2mwPAPpd2WiAU&oq=define%3Asystem&gs_lp=EhNtb2JpbGUtZ3dzLXdpei1zZXJwIg1kZWZpbmU6c3lzdGVtSI9sUM4IWI5ocAJ4AZABAZgB4QGgAfMSqgEGMjAuNC4xuAEDyAEA-AEBqAIPwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAPCAhMQLhiABBiKBRhDGMcBGNEDGLADwgIKECMYgAQYigUYJ8ICCBAAGIAEGMsBwgIHECMY6gIYJ8ICBBAjGCfCAgoQABiABBiKBRhDwgIUEC4YgAQYigUYsQMYgwEYxwEYrwHCAgsQABiABBixAxiDAcICCBAAGIAEGLEDwgIOEC4YgAQYxwEYrwEYjgXCAg4QLhiABBiKBRixAxiDAcICCBAuGIAEGLEDwgIFEAAYgATCAgQQABgDwgIHEAAYgAQYCogGAZAGEQ&sclient=mobile-gws-wiz-serp`;
        } else {
          context.player.menuOptions.textEdit = {
            edit: item.selection,
            bgColor: undefined,
            comments: undefined,
            editWith: item.selection
          };
        }
      }}
      menuItems={{
        selector: "#novel",
        rows: [
          {
            cols: [
              {
                text: "Copy",
                icon: "content_copy"
              },
              {
                text: "Translate",
                icon: "translate"
              },
              {
                text: "Define",
                icon: "search"
              }
            ]
          },
          {
            cols: [
              {
                text: "Edit",
                icon: "edit_note"
              }
            ]
          }
        ]
      }}
      bottomReched={() => context.player.next(true)}
      topReched={() => context.player.prev()}
      onScroll={(y: number) => {
        context.player.currentChapterSettings.scrollProgress = y;

        context.player.currentChapterSettings.saveChanges();
      }}
    />
  );
};

export default (props: any) => {
  const [{ name, url, parserName, epub, chapter }, nav] = useNavigation(props);
  const updater = useUpdate();
  const loader = useLoader(true);
  useKeepAwake();
  const files = context.files.useFile(
    "json",
    x => {
      return x.has(
        "".fileName(name, parserName)
      );
    },
    "New"
  );
  const state = buildState(
    {
      novel: {} as DetailInfo,
      parser: context.parser.find(parserName),
      book: {} as Book
    }).ignore(
      "book",
      "parser",
      "novel"
    ).build();

  context.hook("appSettings.backgroundColor");

  const loadData = async () => {
    // console.warn({name,url, parserName, epub, chapter})
    try {
      loader.show();
      if (state.novel.url) {
        loader.hide();
        return;
      }

      state.novel =
        parserName == "epub" || epub
          ? files.fileItems.find(x => x.url === url)
          : await state.parser?.detail(url, true);
      // console.warn([state.novel].niceJson("chapters"))
      if (!state.novel || !state.novel.name)
        return;
      if (
        !context.player.novel ||
        context.player.novel.url !== url ||
        context.player.isEpup != (epub === true)
      ) {
        let book = await context
          .db()
          .querySelector<Book>("Books")
          .LoadChildren<Chapter>(
            "Chapters",
            "parent_Id",
            "id",
            "chapterSettings",
            true
          )
          .Where.Column(x => x.url)
          .EqualTo(url)
          .AND.Column(x => x.parserName)
          .EqualTo(parserName)
          .findOrSave(
            Book.n()
              .Url(state.novel.url)
              .Name(state.novel.name)
              .ParserName(parserName)
              .ImageBase64(
                await context
                  .http()
                  .imageUrlToBase64(state.novel.image)
              )
          );

        if (!book.textReplacements) book.textReplacements = [];
        state.book = book;

        context.player = new Player(
          state.novel,
          state.book,
          {
            show: () => {
              loader.show();
              context.player.isloading = true;
            },
            hide: () => {
              loader.hide();
              context.player.isloading = false;
            }
          },
          epub === true
        );
        await context.player.jumpTo(chapter);
      } else {
        context.player.novel = state.novel = state.novel;
        state.book = context.player.book;
        context.player.loader = {
          show: () => {
            loader.show();
            context.player.isloading = true;
          },
          hide: () => {
            loader.hide();
            context.player.isloading = false;
          }
        };
        context.player.hooked = true;
        context.player.viewState = "Default";
        await context.player.jumpTo(chapter);
        loader.hide();
      }
    } catch (e) {
      console.error(e);
    } finally {
      // loader.hide();
    }
  };

  if (parserName == "epub" || epub)
    useEffect(() => {
      if (!files.loading) loadData();
    }, [files.loading]);

  useEffect(() => {
    context.isFullScreen = true;
    if (parserName != "epub" && !epub) loadData();
    return () => {
      context.player.loader = undefined;
      context.isFullScreen = false;
      context.player.hooked = false;
      if (context.player.showPlayer && context.player.playing())
        context.player.viewState = "Folded";
    };
  }, []);

  context.useEffect(() => {
    if (context.player.networkError) {
      context
        .alert(
          `Something went wrong as the chapter could not be retrieved. Please check your internet connection.\nWould you like to retry`,
          "Error"
        )
        .confirm(answer => {
          if (answer) context.player.jumpTo();
        });
    }
  }, "player.networkError");

  if (
    loader.loading &&
    (!state.novel.name || !context.player?.currentChapterSettings)
  ) {
    return loader.elem;
  }
  return (
    <>
      {loader.elem}
      <View
        css="flex"
        style={{
          backgroundColor: context.appSettings.backgroundColor
        }}
      >
        <Modoles />
        <Controller state={state} {...props} />
        <InternalWeb state={state} {...props} />
      </View>
    </>
  );
};
