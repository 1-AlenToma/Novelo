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
  ChapterView
} from "../../components/";
import WebView from "react-native-webview";
import Fonts from "../../assets/Fonts";
import { useEffect, useRef } from "react";
import translate from "translate-google-api";
import { LANGUAGE_TABLE } from "react-native-translator/dist/utils/languageCodeConverter";
import {
  ScrollView,
  Linking
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  useNavigation,
  useUpdate,
  useTimer,
  useDbHook
} from "../../hooks";
import {
  useState,
  Player,
  DetailInfo
} from "../../native";
import Header from "../../pages/Header";
import { Book, Chapter } from "../../db";
import {
  arrayBuffer,
  newId,
  proc,
  invertColor,
  sleep
} from "../../Methods";
import { useKeepAwake } from "expo-keep-awake";
const lang = {};

for (let l in LANGUAGE_TABLE) {
  let item = LANGUAGE_TABLE[l].google;
  if (item) {
    lang[item.toLowerCase()] = l;
    lang[item.safeSplit("-", -1).toLowerCase()] =
      l;
  }
}

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
    "size"
  );

  const Timer = useTimer(100);
  const audioProgressTimer = useTimer(100);
  const thisState = useState({
    cText: "",
    chapterSliderValue: undefined
  });

  useEffect(() => {
    if (context.appSettings.lockScreen)
      context.orientation("LANDSCAPE");

    return () => {
      context.orientation("Default");
    };
  }, []);

  const editSettings = ({
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
    shadowLength
  }: any) => {
    Timer(async () => {
      if (fontSize != undefined)
        context.appSettings.fontSize = fontSize;
      if (isBold != undefined) {
        context.appSettings.isBold = isBold;
      }
      if (backgroundColor !== undefined)
        context.appSettings.backgroundColor =
          backgroundColor;
      if (textAlign != undefined)
        context.appSettings.textAlign = textAlign;
      if (lockScreen != undefined) {
        context.appSettings.lockScreen =
          lockScreen;
        if (context.appSettings.lockScreen)
          context.orientation("LANDSCAPE");
        else context.orientation("Default");
      }
      if (rate != undefined)
        context.appSettings.rate = rate;
      if (pitch != undefined)
        context.appSettings.pitch = pitch;
      if (fontName)
        context.appSettings.fontName = fontName;
      if (voice)
        context.appSettings.voice = voice;
      if (margin != undefined)
        context.appSettings.margin = margin;
      if (navigationType != undefined)
        context.appSettings.navigationType =
          navigationType;
      if (use3D != undefined)
        context.appSettings.use3D = use3D;
      if (fontStyle != undefined)
        context.appSettings.fontStyle = fontStyle;
      if (shadowLength != undefined)
        context.appSettings.shadowLength =
          shadowLength;

      await context.appSettings.saveChanges();
    });
  };

  return (
    <>
      <View
        ifTrue={context.player.showController}
        css={`band he:110 bottom juc:center ali:center pal:10 par:10 botw:1 boc:${invertColor(
          context.appSettings.backgroundColor
        )}`}
        invertColor={true}>
        <Text
          invertColor={true}
          css="desc fos:13">
          {context.player.procent(
            thisState.chapterSliderValue
          )}
        </Text>
        <View css="clearwidth juc:center ali:center">
          <Slider
            invertColor={true}
            buttons={true}
            disableTimer={true}
            value={
              context.player.currentChapterIndex
            }
            onValueChange={v => {
              thisState.chapterSliderValue = v;
            }}
            onSlidingComplete={index => {
              Timer(() => {
                context.player.jumpTo(index);
                thisState.chapterSliderValue =
                  undefined;
              });
            }}
            minimumValue={0}
            maximumValue={
              context.player.novel.chapters
                .length - 1
            }
          />
        </View>
        <View css="clearwidth ali:center juc:center ">
          <Text
            numberOfLines={1}
            invertColor={true}
            css="header bold fos:18 foso:italic">
            {state.book.name}
          </Text>
          <Text
            numberOfLines={1}
            css="desc color:red">
            {
              context.player
                .currentChapterSettings?.name
            }
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
                }>
                <ChapterView
                  book={state.book}
                  novel={state.novel}
                  onPress={item => {
                    context.player.jumpTo(
                      item.url
                    );
                  }}
                  current={
                    context.player.currentChapter
                      .url
                  }
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
                }>
                <View css="flex">
                  <TabBar
                    fontSize={14}
                    scrollableHeader={true}
                    position="Top">
                    <View
                      title="Settings"
                      css="flex">
                      <Form text="NavigationMethod">
                        <DropdownList
                          height={200}
                          toTop={true}
                          selectedIndex={
                            context.appSettings
                              .navigationType
                          }
                          updater={[
                            context.appSettings
                              .navigationType
                          ]}
                          hooks={[
                            "appSettings.navigationType"
                          ]}
                          items={[
                            "Scroll",
                            "Snap"
                          ]}
                          render={item => {
                            return (
                              <View
                                css={`
                                  ${item ==
                                  context
                                    .appSettings
                                    .navigationType
                                    ? "selectedRow"
                                    : ""} ali:center pal:10 bor:5 flex row juc:space-between mih:24
                                `}>
                                <Text
                                  css={`desc fos:13`}
                                  invertColor={
                                    true
                                  }>
                                  {item}
                                </Text>
                              </View>
                            );
                          }}
                          onSelect={navigationType => {
                            editSettings({
                              navigationType
                            });
                          }}
                          selectedValue={
                            context.appSettings
                              .navigationType ||
                            "Snap"
                          }
                        />
                      </Form>

                      <Form text="Font">
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
                          items={Object.keys(
                            Fonts
                          )}
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
                                `}>
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
                                  }>
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
                      <Form text="FontSize">
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
                          minimumValue={15}
                          maximumValue={40}
                        />
                      </Form>

                      <Form text="FontStyle">
                        <DropdownList
                          height={200}
                          toTop={true}
                          selectedIndex={
                            context.appSettings
                              .fontStyle
                          }
                          updater={[
                            context.appSettings
                              .fontStyle
                          ]}
                          hooks={[
                            "appSettings.fontStyle"
                          ]}
                          items={[
                            "normal",
                            "italic",
                            "oblique"
                          ]}
                          render={item => {
                            return (
                              <View
                                css={`
                                  ${item ==
                                  (context
                                    .appSettings
                                    .fontStyle ??
                                    "normal")
                                    ? "selectedRow"
                                    : ""} ali:center pal:10 bor:5 flex row juc:space-between mih:24
                                `}>
                                <Text
                                  css={`desc fos:13`}
                                  invertColor={
                                    true
                                  }>
                                  {item.displayName()}
                                </Text>
                              </View>
                            );
                          }}
                          onSelect={fontStyle => {
                            editSettings({
                              fontStyle
                            });
                          }}
                          selectedValue={(
                            context.appSettings
                              .fontStyle ||
                            "normal"
                          ).displayName()}
                        />
                      </Form>
                      <Form text="Padding">
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

                      <CheckBox
                        text="3D Font:"
                        css="pal:1"
                        invertColor={true}
                        checked={
                          context.appSettings
                            .use3D
                        }
                        onChange={() => {
                          editSettings({
                            use3D:
                              !context.appSettings
                                .use3D
                          });
                        }}>
                        <Form
                          text="Shadow Length"
                          ifTrue={() =>
                            context.appSettings
                              .use3D == true
                          }>
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
                      <Form
                        css="row"
                        text="TextAlign">
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
                            css="mar:5">
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
                      <Form
                        css="form he:200"
                        text="InlineStyle">
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
                    <View title="Voice">
                      <Form text="Voices">
                        <DropdownList
                          height="80"
                          toTop={true}
                          updater={[
                            context.player
                              .testVoice
                          ]}
                          hooks={[
                            "player.testVoice"
                          ]}
                          items={context.voices}
                          onSearch={(
                            item,
                            txt
                          ) => {
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
                          selectedIndex={context.voices.findIndex(
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
                                `}>
                                <Text
                                  css={`desc fos:13`}
                                  invertColor={
                                    true
                                  }>
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
                                  ({item.language}
                                  )
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    context.player.testPlaying(
                                      item.name
                                    )
                                  }>
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
                                    size={35}
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
                            context.appSettings
                              .rate
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
                    </View>
                    <View title="Text Replacements">
                      <View
                        style={{
                          height: proc(
                            95,
                            context.size.window
                              .height
                          )
                        }}
                        css="clearboth juc:flex-start mih:100%">
                        <ItemList
                          css="flex"
                          items={
                            context.player.book
                              .textReplacements
                          }
                          container={({
                            item
                          }) => (
                            <View
                              style={{
                                backgroundColor:
                                  item.bgColor
                              }}
                              css="flex di:flex row juc:space-between ali:center pal:10 bor:2">
                              <Text
                                css="desc fos:13"
                                invertColor={
                                  true
                                }>
                                {item.edit}
                              </Text>
                              <Text
                                css="desc fos:13"
                                invertColor={
                                  true
                                }>
                                {item.editWith}
                              </Text>
                              <TouchableOpacity
                                onPress={async () => {
                                  context.player.book.textReplacements =
                                    context.player.book.textReplacements.filter(
                                      x =>
                                        x != item
                                    );

                                  await context.player.book.saveChanges();
                                  await context.player.clean();
                                }}
                                css="button">
                                <Text
                                  invertColor={
                                    true
                                  }>
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
const InternalWeb = ({
  state,
  ...props
}: any) => {
  const updater = useUpdate();
  useDbHook(
    "Chapters",
    item => item.parent_Id === state.book.id,
    () => context.player.currentChapterSettings,
    "audioProgress"
  );
  context.subscribe(
    () => {
      updater();
    },
    "player.html",
    "player.book.inlineStyle",
    "player.showPlayer"
  );
  let color = context.appSettings.backgroundColor;

  let inverted = invertColor(color);
  let shadow = inverted.has("white")
    ? "#4e4d4d"
    : "#919191";
  let shadowLength = (1).sureValue(
    context.appSettings.shadowLength,
    true
  );

  return (
    <Web
      style={{
        backgroundColor: color
      }}
      navigationType={
        context.appSettings.navigationType
      }
      scrollDisabled={context.player.showPlayer}
      fontName={context.appSettings.fontName}
      inlineStyle={
        context.player.book.inlineStyle
      }
      css={`
        *:not(context):not(context *) {
          font-family: "${context.appSettings
            .fontName}";
          font-size-adjust: 1;
          font-style: ${context.appSettings
            .fontStyle ?? "normal"};
          ${context.appSettings.use3D
            ? `
            text-shadow: 1px ${shadowLength}px 1px ${shadow};
            `
            : ""}
        }
        parameter {
          display: none;
        }
        blur p {
          color: ${color};
          background-color: ${inverted};
          padding: 5px;
          border-radius: 10px;
          overflow: hidden;
        }
        *:not(context):not(context *):not(
            .custom
          ):not(blur):not(blur *) {
          background-color: transparent;
          color: ${inverted} !important;
        }
        body {
          background-color: ${color} !important;
        }
        .comments {
          text-decoration: underline;
          display: inline-block;
          position: relative;
        }
        context > div > a {
          width: 100%;
        }
        body img {
          max-width: 98%;
        }
        body .novel {
          max-width: 100%;
          min-height: ${!context.player.showPlayer
            ? "100%"
            : "50%"};
          top: ${context.player.showPlayer
            ? "45px"
            : "0px"};
          position: relative;
          overflow: hidden;
          text-align-vertical: top;
          padding-bottom: ${context.player.paddingBottom()}px;
          padding-top: ${context.player.paddingTop()}px;
          padding-left: ${(5).sureValue(
            context.appSettings.margin
          )}px;
          padding-right: ${(5).sureValue(
            context.appSettings.margin
          )}px;
          font-size: ${context.appSettings
            .fontSize}px;
          line-height: ${context.appSettings
            .fontSize * 1.7}px;
          text-align: ${context.appSettings
            .textAlign};
        }
      `}
      click={() => {
        context.player.showController =
          !context.player.showController;
      }}
      onComments={index => {
        state.comment =
          context.player.book.textReplacements[
            index
          ].comments;
      }}
      onMenu={(item: any) => {
        // handle later
        if (item.item.text == "Translate")
          state.textToTranslate = item.selection;
        else if (item.item.text === "Copy") {
          Clipboard.setStringAsync(
            item.selection
          );
        } else if (item.item.text === "Define") {
          state.define = `https://www.google.com/search?q=define%3A${item.selection.replace(
            / /g,
            "+"
          )}&sca_esv=ae00ca4afbc9d4da&sxsrf=ACQVn09Tncl4Kw9jpIkzEAaZtuZjWgKj5Q%3A1708602991908&ei=bzbXZcP_Ns2mwPAPpd2WiAU&oq=define%3Asystem&gs_lp=EhNtb2JpbGUtZ3dzLXdpei1zZXJwIg1kZWZpbmU6c3lzdGVtSI9sUM4IWI5ocAJ4AZABAZgB4QGgAfMSqgEGMjAuNC4xuAEDyAEA-AEBqAIPwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAPCAhMQLhiABBiKBRhDGMcBGNEDGLADwgIKECMYgAQYigUYJ8ICCBAAGIAEGMsBwgIHECMY6gIYJ8ICBBAjGCfCAgoQABiABBiKBRhDwgIUEC4YgAQYigUYsQMYgwEYxwEYrwHCAgsQABiABBixAxiDAcICCBAAGIAEGLEDwgIOEC4YgAQYxwEYrwEYjgXCAg4QLhiABBiKBRixAxiDAcICCBAuGIAEGLEDwgIFEAAYgATCAgQQABgDwgIHEAAYgAQYCogGAZAGEQ&sclient=mobile-gws-wiz-serp`;
        } else {
          state.textEdit = {
            edit: item.selection,
            bgColor: undefined,
            comments: undefined,
            editWith: item.selection
          };
        }
      }}
      content={{
        content: `
          <div id="novel" style="visibility:hidden" class="novel">
          ${
            context.player.showPlayer
              ? `<p>${
                  context.player
                    .currentPlaying()
                    ?.cleanText() ?? ""
                }</p>`
              : context.player.html
          }
          </div>`,
        scroll:
          context.player.currentChapterSettings
            .scrollProgress
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
      bottomReched={() =>
        context.player.next(true)
      }
      topReched={() => context.player.prev()}
      onScroll={(y: number) => {
        context.player.currentChapterSettings.scrollProgress =
          y;

        context.player.currentChapterSettings.saveChanges();
      }}
    />
  );
};

export default (props: any) => {
  const [
    { url, parserName, epub, chapter },
    nav
  ] = useNavigation(props);
  const updater = useUpdate();
  const loader = useLoader(true);
  useKeepAwake();
  const files = context.files().useFile(
    "json",
    x => {
      return x.has(
        "".fileName(
          url,
          parserName == "epub" ? "" : parserName
        )
      );
    },
    "New"
  );
  const state = useState(
    {
      novel: {} as DetailInfo,
      parser: context.parser.find(parserName),
      book: {} as Book,
      textToTranslate: undefined,
      translationLanguage: "English",
      translationResult: "",
      textEdit: undefined,
      comment: undefined,
      define: undefined
    },
    "book",
    "parser","novel"
  );

  useDbHook(
    "AppSettings",
    item => true,
    () => context.appSettings,
    "*"
  );

  const loadData = async () => {
    try {
      loader.show();
      if (state.novel.url) {
        loader.hide();
        return;
      }

      state.novel =
        parserName == "epub" || epub
          ? files.fileItems.find(
              x => x.url === url
            )
          : await state.parser.detail(url, true);
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
                  .imageUrlToBase64(
                    state.novel.image
                  )
              )
          );

        if (!book.textReplacements)
          book.textReplacements = [];
        state.book = book;

        context.player = new Player(
          state.novel,
          state.book,
          {
            show: () => loader.show(),
            hide: () => loader.hide()
          },
          epub === true
        );
        await context.player.jumpTo(chapter);
      } else {
        context.player.novel = state.novel =
          state.novel;
        state.book = context.player.book;
        context.player.loader = {
          show: () => loader.show(),
          hide: () => loader.hide()
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
      context.isFullScreen = false;
      context.player.hooked = false;
      if (
        context.player.showPlayer &&
        context.player.playing()
      )
        context.player.viewState = "Folded";
    };
  }, []);

  context.subscribe(() => {
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
    (!state.novel.name ||
      !context.player?.currentChapterSettings)
  ) {
    return loader.elem;
  }
  return (
    <>
      {loader.elem}
      <Modal
        blur={false}
        visible={state.comment != undefined}
        onHide={() => (state.comment = undefined)}
        height={200}>
        <View css="flex mat:20">
          <TextInput
            onChangeText={x =>
              (state.comment = x)
            }
            readOnly={true}
            invertColor={false}
            css="pa:5 bor:2 flg:1 clearboth"
            multiline={true}
            defaultValue={state.comment}
          />
        </View>
      </Modal>
      <Modal
        blur={false}
        visible={state.textEdit != undefined}
        onHide={() =>
          (state.textEdit = undefined)
        }
        height="90">
        <ScrollView>
          <View css="flex mat:20">
            <Form
              root={true}
              text="TextToEdit"
              css="formRow he:100">
              <TextInput
                onChangeText={x =>
                  (state.textEdit.edit = x)
                }
                invertColor={false}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  state.textEdit?.edit
                }
              />
            </Form>
            <Form
              root={true}
              text="EditWith"
              css="formRow he:100">
              <TextInput
                onChangeText={x =>
                  (state.textEdit.editWith = x)
                }
                invertColor={false}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  state.textEdit?.editWith
                }
              />
            </Form>
            <Form
              root={true}
              text="Comment"
              css="formRow he:100">
              <TextInput
                onChangeText={x =>
                  (state.textEdit.comments = x)
                }
                invertColor={false}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  state.textEdit?.comments
                }
              />
            </Form>
            <Form text="BackgroundColor">
              <ColorPicker
                value={
                  state.textEdit?.bgColor ??
                  "#ffffff"
                }
                onComplete={({ hex }) =>
                  (state.textEdit = {
                    ...state.textEdit,
                    bgColor: hex
                  })
                }
              />
            </Form>
            <TouchableOpacity
              onPress={async () => {
                context.player.book.textReplacements.push(
                  state.textEdit
                );
                await context.player.book.saveChanges();
                await context.player.clean();
                state.textEdit = undefined;
              }}
              css="button clearwidth bow:1 boc:#ccc bor:5 juc:center">
              <Text invertColor={true}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      <Modal
        blur={false}
        visible={
          state.textToTranslate != undefined
        }
        onHide={() =>
          (state.textToTranslate = undefined)
        }
        height="100">
        <View css="flex mat:20">
          <View css="form">
            <Text invertColor={true}>
              TranslateTo:
            </Text>
            <DropdownList
              height="80"
              toTop={true}
              items={Object.keys(LANGUAGE_TABLE)}
              render={item => {
                return (
                  <Text
                    css="desc fos:13"
                    invertColor={true}>
                    {item}
                  </Text>
                );
              }}
              onSelect={language => {
                context.appSettings.lang =
                  language;
                context.appSettings.saveChanges();
              }}
              selectedValue={
                context.appSettings.lang ??
                "English"
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
                uri: `https://translate.google.com/m?hl=en&sl=en&tl=${
                  LANGUAGE_TABLE[
                    context.appSettings.lang ??
                      "English"
                  ].google
                }&ie=UTF-8&prev=_m&q=${encodeURIComponent(
                  state.textToTranslate
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
              allowUniversalAccessFromFileURLs={
                true
              }
              javaScriptEnabled={true}
            />
          </View>
        </View>
      </Modal>

      <Modal
        blur={false}
        visible={state.define != undefined}
        onHide={() => (state.define = undefined)}
        height="100">
        <View css="flex mat:20">
          <View css="form flex">
            <WebView
              nestedScrollEnabled={true}
              cacheEnabled={true}
              source={{
                uri: state.define
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
              allowUniversalAccessFromFileURLs={
                true
              }
              javaScriptEnabled={true}
            />
          </View>
        </View>
      </Modal>
      <View
        css="flex"
        style={{
          backgroundColor:
            context.appSettings.backgroundColor
        }}>
        <Controller
          state={state}
          {...props}
        />
        <InternalWeb
          state={state}
          {...props}
        />
      </View>
    </>
  );
};
