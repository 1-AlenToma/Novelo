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
  DropdownList
} from "../../components/";
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
import g from "../../GlobalContext";
import Header from "../../pages/Header";
import { Book, Chapter } from "../../db";
import {
  arrayBuffer,
  newId,
  proc,
  invertColor,
  sleep
} from "../../Methods";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider
} from "reanimated-color-picker";
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
    () => g.player.currentChapterSettings,
    "audioProgress"
  );

  g.hook(
    "player.showController",
    "player.showPlayer",
    "player.chapterArray",
    "player.currentChapter",
    "player._playing"
  );

  const Timer = useTimer(100);
  const audioProgressTimer = useTimer(100);
  const thisState = useState({
    cText: "",
    chapterSliderValue: undefined
  });

  useEffect(() => {
    if (g.appSettings.lockScreen)
      g.orientation("LANDSCAPE");

    return () => {
      g.orientation("Default");
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
    rate
  }: any) => {
    Timer(async () => {
      if (fontSize != undefined)
        g.appSettings.fontSize = fontSize;
      if (isBold != undefined) {
        g.appSettings.isBold = isBold;
      }
      if (backgroundColor !== undefined)
        g.appSettings.backgroundColor =
          backgroundColor;
      if (textAlign != undefined)
        g.appSettings.textAlign = textAlign;
      if (lockScreen != undefined) {
        g.appSettings.lockScreen = lockScreen;
        if (g.appSettings.lockScreen)
          g.orientation("LANDSCAPE");
        else g.orientation("Default");
      }
      if (rate != undefined)
        g.appSettings.rate = rate;
      if (pitch != undefined)
        g.appSettings.pitch = pitch;
      if (fontName)
        g.appSettings.fontName = fontName;
      if (voice) g.appSettings.voice = voice;

      await g.appSettings.saveChanges();
    });
  };

  return (
    <>
      <View
        ifTrue={g.player.showController}
        css="band he:110 bottom juc:center ali:center pal:10 par:10"
        invertColor={true}>
        <Text
          invertColor={true}
          css="desc bold foso:italic">
          {g.player.procent(
            thisState.chapterSliderValue
          )}
        </Text>
        <View>
          <Slider
            invertColor={true}
            buttons={true}
            disableTimer={true}
            value={g.player.currentChapterIndex}
            onValueChange={v => {
              thisState.chapterSliderValue = v;
            }}
            onSlidingComplete={index => {
              Timer(() => {
                g.player.jumpTo(index);
                thisState.chapterSliderValue =
                  undefined;
              });
            }}
            minimumValue={0}
            maximumValue={
              g.player.novel.chapters.length - 1
            }
          />
        </View>
        <View css="clearwidth ali:center juc:center">
          <Text
            invertColor={true}
            css="header bold fos:18 foso:italic">
            {state.book.name}
          </Text>
          <Text css="desc color:red">
            {
              g.player.currentChapterSettings
                ?.name
            }
          </Text>
        </View>
      </View>
      <Header
        ifTrue={g.player.showController}
        css="absolute to:0"
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
              g.player.playing(false);
              g.player.showPlayer =
                !g.player.showPlayer;
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
                <View
                  style={{
                    height: proc(
                      95,
                      g.size.window.height
                    )
                  }}
                  css="clearboth juc:flex-start mih:100%">
                  <View css="juc:flex-start clearboth ali:center he:30 mab:10 mat:10">
                    <TextInput
                      onChangeText={x =>
                        (thisState.cText = x)
                      }
                      invertColor={false}
                      css="wi:90% pa:5 bor:2"
                      defaultValue={
                        thisState.cText
                      }
                      placeholder="Search for chapter"
                    />
                  </View>
                  <ItemList
                    css="flex"
                    onPress={item => {
                      g.player.jumpTo(item.url);
                    }}
                    selectedIndex={state.novel.chapters?.findIndex(
                      x =>
                        x.url ==
                        g.player.currentChapter
                          .url
                    )}
                    items={state.novel.chapters?.filter(
                      x =>
                        thisState.cText == "" ||
                        x.name
                          .toLowerCase()
                          .indexOf(
                            thisState.cText.toLowerCase()
                          ) !== -1
                    )}
                    container={({
                      item,
                      index
                    }) => (
                      <View
                        css={`flex he:20 row juc:space-between ali:center pal:5 bor:2 ${
                          g.player.currentChapter
                            .url == item.url
                            ? "selectedRow"
                            : ""
                        }`}>
                        <Text
                          css="bold desc"
                          invertColor={true}>
                          {item.name.safeSplit(
                            "/",
                            -1
                          )}
                        </Text>
                        <View css="row">
                          <Icon
                            invertColor={true}
                            color={
                              g.player.book.chapterSettings.find(
                                x =>
                                  x.url ==
                                  item.url
                              )?.scrollProgress >=
                              200
                                ? "green"
                                : undefined
                            }
                            size={16}
                            type="MaterialIcons"
                            name="preview"
                          />
                          <Icon
                            invertColor={true}
                            color={
                              g.player.book.chapterSettings.find(
                                x =>
                                  x.url ==
                                  item.url
                              )?.isFinished
                                ? "green"
                                : undefined
                            }
                            size={16}
                            type="AntDesign"
                            name="checkcircle"
                          />
                        </View>
                      </View>
                    )}
                    itemCss="pa:5 clearwidth bobw:1 boc:gray"
                    vMode={true}
                  />
                </View>
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
                    scrollableHeader={true}
                    position="Top"
                    scrollHeight={proc(
                      95,
                      g.size.window.height
                    )}>
                    <View
                      title="Settings"
                      css="flex">
                      <View css="form">
                        <Text invertColor={true}>
                          Font:
                        </Text>
                        <DropdownList
                          height="80"
                          toTop={true}
                          selectedIndex={Object.keys(
                            Fonts
                          ).findIndex(
                            x =>
                              x ==
                              g.appSettings
                                .fontName
                          )}
                          updater={[
                            g.appSettings.fontName
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
                                  g.appSettings
                                    .fontName
                                    ? "selectedRow"
                                    : ""} ali:center pal:10 bor:5 flex row juc:space-between mih:24
                                `}>
                                <Text
                                  css={`bold desc`}
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
                            g.appSettings
                              .fontName ||
                            "SourceSans3-Black"
                          }
                        />
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          FontSize:
                        </Text>
                        <Slider
                          invertColor={true}
                          buttons={true}
                          value={
                            g.appSettings.fontSize
                          }
                          onSlidingComplete={fontSize => {
                            editSettings({
                              fontSize
                            });
                          }}
                          minimumValue={15}
                          maximumValue={40}
                        />
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          IsBold:
                        </Text>
                        <CheckBox
                          css="pal:1"
                          invertColor={true}
                          checked={
                            g.appSettings.isBold
                          }
                          onChange={() => {
                            editSettings({
                              isBold:
                                !g.appSettings
                                  .isBold
                            });
                          }}
                        />
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          LockScreen:
                        </Text>
                        <CheckBox
                          css="pal:1"
                          invertColor={true}
                          checked={
                            g.appSettings
                              .lockScreen
                          }
                          onChange={() => {
                            editSettings({
                              lockScreen:
                                !g.appSettings
                                  .lockScreen
                            });
                          }}
                        />
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          Background:
                        </Text>
                        <ColorPicker
                          style={{
                            width: "70%"
                          }}
                          value={
                            g.appSettings
                              .backgroundColor
                          }
                          onComplete={({ hex }) =>
                            editSettings({
                              backgroundColor: hex
                            })
                          }>
                          <Preview />
                          <Panel1 />
                          <HueSlider />
                        </ColorPicker>
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          TextAlign
                        </Text>
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
                                  g.appSettings
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
                      </View>
                      <View css="form he:200">
                        <Text invertColor={true}>
                          InlineStyle
                        </Text>
                        <TextInput
                          invertColor={false}
                          css="wi:90% pa:5 bor:2 he:100%"
                          multiline={true}
                          defaultValue={
                            g.player.book
                              .inlineStyle
                          }
                          onChangeText={t =>
                            editSettings({
                              inlineStyle: t
                            })
                          }
                        />
                      </View>
                    </View>
                    <View title="Voice">
                      <View css="form">
                        <Text invertColor={true}>
                          Voices:
                        </Text>
                        <DropdownList
                          disableInput={true}
                          height="80"
                          toTop={true}
                          updater={[
                            g.player.testVoice
                          ]}
                          hooks={[
                            "player.testVoice"
                          ]}
                          items={g.voices}
                          selectedIndex={g.voices.findIndex(
                            x =>
                              x.name ==
                              g.appSettings.voice
                          )}
                          render={item => {
                            return (
                              <View
                                css={`
                                  ${item.name ==
                                  g.appSettings
                                    .voice
                                    ? "selectedRow"
                                    : ""} ali:center pal:10 bor:5 flex row juc:space-between
                                `}>
                                <Text
                                  css={`bold desc`}
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
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    g.player.testPlaying(
                                      item.name
                                    )
                                  }>
                                  <Icon
                                    name={
                                      g.player
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
                            g.appSettings.voice ??
                            ""
                          }
                        />
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          Pitch:
                        </Text>
                        <View css="wi:70% row clearheight ali:center">
                          <View
                            invertColor={false}
                            css="wi:40 he:30 juc:center ali:center">
                            <Text
                              css="bold fos:10 tea:center"
                              invertColor={false}>
                              {g.appSettings.pitch.readAble()}
                            </Text>
                          </View>
                          <Slider
                            invertColor={true}
                            buttons={true}
                            step={0.1}
                            value={
                              g.appSettings.pitch
                            }
                            onSlidingComplete={pitch => {
                              editSettings({
                                pitch
                              });
                            }}
                            minimumValue={0.9}
                            maximumValue={3}
                          />
                        </View>
                      </View>
                      <View css="form">
                        <Text invertColor={true}>
                          Rate:
                        </Text>
                        <View css="wi:70% row clearheight ali:center">
                          <View
                            invertColor={false}
                            css="wi:40 he:30 juc:center ali:center">
                            <Text
                              css="bold fos:10 tea:center"
                              invertColor={false}>
                              {g.appSettings.rate.readAble()}
                            </Text>
                          </View>
                          <Slider
                            invertColor={true}
                            buttons={true}
                            step={0.1}
                            value={
                              g.appSettings.rate
                            }
                            onSlidingComplete={rate => {
                              editSettings({
                                rate
                              });
                            }}
                            minimumValue={0.9}
                            maximumValue={3}
                          />
                        </View>
                      </View>
                    </View>
                    <View title="Text Replacements">
                      <View
                        style={{
                          height: proc(
                            95,
                            g.size.window.height
                          )
                        }}
                        css="clearboth juc:flex-start mih:100%">
                        <ItemList
                          css="flex"
                          items={
                            g.player.book
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
                                css="bold desc"
                                invertColor={
                                  true
                                }>
                                {item.edit}
                              </Text>
                              <Text
                                css="bold desc"
                                invertColor={
                                  true
                                }>
                                {item.editWith}
                              </Text>
                              <TouchableOpacity
                                onPress={async () => {
                                  g.player.book.textReplacements =
                                    g.player.book.textReplacements.filter(
                                      x =>
                                        x != item
                                    );

                                  await g.player.book.saveChanges();
                                  await g.player.clean();
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
    () => g.player.currentChapterSettings,
    "audioProgress"
  );
  g.subscribe(
    () => {
      updater();
    },
    "player.html",
    "player.showPlayer"
  );

  return (
    <>
      <Web
        scrollDisabled={g.player.showPlayer}
        fontName={g.appSettings.fontName}
        css={`
          *:not(context):not(context *) {
            font-family: "${g.appSettings
              .fontName}";
          }
          parameter {
            display: none;
          }
          *:not(context):not(context *):not(
              .custom
            ) {
            background-color: ${g.appSettings
              .backgroundColor};
            color: ${invertColor(
              g.appSettings.backgroundColor
            )};
          }
          .comments {
            text-decoration: underline;
            display: inline-block;
            position: relative;
          }
          context > div > a {
            width: 100%;
          }
          body > .novel {
            width: 95%;
            min-height: ${!g.player.showPlayer
              ? "100%"
              : "50%"};
            top: ${g.player.showPlayer
              ? "45px"
              : "0px"};
            position: relative;
            overflow: hidden;
            text-align-vertical: top;
            padding-bottom: ${g.player.paddingBottom()}px;
            padding-top: ${g.player.paddingTop()}px;
            font-size: ${g.appSettings
              .fontSize}px;
            line-height: ${g.appSettings
              .fontSize * 1.7}px;
            text-align: ${g.appSettings
              .textAlign};
            font-weight: ${g.appSettings.isBold
              ? "bold"
              : "normal"};
          }
        `}
        click={() => {
          g.player.showController =
            !g.player.showController;
        }}
        onComments={index => {
          state.comment =
            g.player.book.textReplacements[
              index
            ].comments;
        }}
        onMenu={(item: any) => {
          // handle later
          if (item.item.text == "Translate")
            state.textToTranslate =
              item.selection;
          else if (item.item.text === "Copy") {
            Clipboard.setStringAsync(
              item.selection
            );
          } else if (
            item.item.text === "Define"
          ) {
            let uri = `https://www.google.com/search?q=define%3A${item.selection.replace(
              / /g,
              "+"
            )}&sca_esv=ae00ca4afbc9d4da&sxsrf=ACQVn09Tncl4Kw9jpIkzEAaZtuZjWgKj5Q%3A1708602991908&ei=bzbXZcP_Ns2mwPAPpd2WiAU&oq=define%3Asystem&gs_lp=EhNtb2JpbGUtZ3dzLXdpei1zZXJwIg1kZWZpbmU6c3lzdGVtSI9sUM4IWI5ocAJ4AZABAZgB4QGgAfMSqgEGMjAuNC4xuAEDyAEA-AEBqAIPwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAPCAhMQLhiABBiKBRhDGMcBGNEDGLADwgIKECMYgAQYigUYJ8ICCBAAGIAEGMsBwgIHECMY6gIYJ8ICBBAjGCfCAgoQABiABBiKBRhDwgIUEC4YgAQYigUYsQMYgwEYxwEYrwHCAgsQABiABBixAxiDAcICCBAAGIAEGLEDwgIOEC4YgAQYxwEYrwEYjgXCAg4QLhiABBiKBRixAxiDAcICCBAuGIAEGLEDwgIFEAAYgATCAgQQABgDwgIHEAAYgAQYCogGAZAGEQ&sclient=mobile-gws-wiz-serp`;
            Linking.openURL(uri);
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
            g.player.showPlayer
              ? `<p>${
                  g.player
                    .currentPlaying()
                    ?.cleanText() ?? ""
                }</p>`
              : g.player.html
          }
          </div>`,
          scroll:
            g.player.currentChapterSettings
              .scrollProgress
        }}
        menuItems={{
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
        bottomReched={() => g.player.next(true)}
        topReched={() => g.player.prev()}
        onScroll={async (y: number) => {
          g.player.currentChapterSettings.scrollProgress =
            y;
          //console.log(y);
          await g.player.currentChapterSettings.update(
            "scrollProgress"
          );
        }}
      />
    </>
  );
};

export default (props: any) => {
  const [{ url, parserName, epub }, nav] =
    useNavigation(props);
  const updater = useUpdate();
  const loader = useLoader(true);
  const files = g.files().useFile("json", undefined, "New");
  const state = useState({
    novel: {} as DetailInfo,
    parser: g.parser.find(parserName),
    book: {} as Book,
    textToTranslate: undefined,
    translationLanguage: "English",
    translationResult: "",
    textEdit: undefined,
    comment: undefined
  });

  useDbHook(
    "AppSettings",
    item => true,
    () => g.appSettings,
    "*"
  );

  useEffect(() => {
    (async () => {
      if (!state.textToTranslate) return;
      let tr =
        LANGUAGE_TABLE[state.translationLanguage]
          .google;

      const result = await translate(
        state.textToTranslate,
        {
          tld: "en",
          to: tr
        }
      );
      state.translationResult = result;
    })();
  }, [
    state.textToTranslate,
    state.translationLanguage
  ]);

  const loadData = async () => {
    try {
      loader.show();
      if (state.novel.url) {
        loader.hide();
        return;
      }
      if (
        !g.player.novel ||
        g.player.novel.url !== url ||
        g.player.isEpup != (epub === true)
      ) {
        state.novel =
          parserName == "epub" || epub
            ? files.fileItems.find(
                x => x.url === url
              )
            : await state.parser.detail(url);
        let book = await g
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
                await g
                  .http()
                  .imageUrlToBase64(
                    state.novel.image
                  )
              )
          );

        if (!book.textReplacements)
          book.textReplacements = [];
        state.book = book;

        g.player = new Player(
          state.novel,
          state.book,
          {
            show: () => loader.show(),
            hide: () => loader.hide()
          },
          epub === true
        );
        await g.player.jumpTo();
      } else {
        state.novel = g.player.novel;
        state.book = g.player.book;
        g.player.loader = {
          show: () => loader.show(),
          hide: () => loader.hide()
        };
        g.player.hooked = true;
        g.player.viewState = "Default";
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
    g.isFullScreen = true;
    if (parserName != "epub" && !epub) loadData();
    return () => {
      g.isFullScreen = false;
      g.player.hooked = false;
      if (
        g.player.showPlayer &&
        g.player.playing()
      )
        g.player.viewState = "Folded";
    };
  }, []);

  if (
    loader.loading &&
    (!state.novel.name ||
      !g.player?.currentChapterSettings)
  )
    return loader.elem;
  return (
    <>
      {loader.elem}
      <Modal
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
        visible={state.textEdit != undefined}
        onHide={() =>
          (state.textEdit = undefined)
        }
        height="90">
        <View css="flex mat:20">
          <View css="formRow he:100">
            <Text invertColor={true}>
              TextToEdit:
            </Text>
            <TextInput
              onChangeText={x =>
                (state.textEdit.edit = x)
              }
              invertColor={false}
              css="pa:5 bor:2 flg:1"
              multiline={true}
              defaultValue={state.textEdit?.edit}
            />
          </View>
          <View css="formRow he:100">
            <Text invertColor={true}>
              EditWith:
            </Text>
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
          </View>
          <View css="formRow he:100">
            <Text invertColor={true}>
              Comments:
            </Text>
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
          </View>
          <View css="formRow">
            <Text invertColor={true}>
              Background:
            </Text>
            <ColorPicker
              style={{
                width: "70%"
              }}
              value={state.textEdit?.bgColor}
              onComplete={({ hex }) =>
                (state.textEdit.bgColor = hex)
              }>
              <Preview />
              <Panel1 />
              <HueSlider />
            </ColorPicker>
          </View>
          <TouchableOpacity
            onPress={async () => {
              g.player.book.textReplacements.push(
                state.textEdit
              );
              await g.player.book.saveChanges();
              await g.player.clean();
              state.textEdit = undefined;
            }}
            css="button clearwidth bow:1 boc:#ccc bor:5 juc:center">
            <Text invertColor={true}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        visible={
          state.textToTranslate != undefined
        }
        onHide={() =>
          (state.textToTranslate = undefined)
        }
        height={300}>
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
                    css="bold desc"
                    invertColor={true}>
                    {item}
                  </Text>
                );
              }}
              onSelect={language => {
                state.translationLanguage =
                  language;
              }}
              selectedValue={
                state.translationLanguage
              }
            />
          </View>
          <View css="form he:80%">
            <TextInput
              invertColor={false}
              css="clearboth pa:5 bor:2"
              multiline={true}
              readOnly={true}
              value={state.translationResult}
            />
          </View>
        </View>
      </Modal>
      <Controller
        state={state}
        {...props}
      />
      <InternalWeb
        state={state}
        {...props}
      />
    </>
  );
};
