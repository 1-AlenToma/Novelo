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
import {
  ScrollView,
  Linking
} from "react-native";
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

const Controller = ({ state, ...props }) => {
  useDbHook(
    "Chapters",
    item => item.parent_Id === state.book.id,
    () => g.player.currentChapterSettings,
    "audioProgress"
  );

  g.hook(
    "player.showController",
    "appSettings",
    "player.showPlayer",
    "player.chapterArray",
    "player._playing"
  );

  const Timer = useTimer(100);
  const audioProgressTimer = useTimer(100);
  const thisState = useState({
    cText: ""
  });

  useEffect(() => {
    if (g.appSettings.lockScreen)
      g.orientation("LANDSCAPE");

    return () => {
      g.orientation("Default");
    };
  }, []);

  const editSettings = async ({
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
      if (isBold != undefined)
        g.appSettings.isBold = isBold;
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
        css="band he:150 bottom juc:center ali:center pal:10 par:10"
        invertColor={true}>
        <Text
          invertColor={true}
          css="desc bold foso:italic">
          {g.player.procent()}
        </Text>
        <View>
          <Slider
            invertColor={true}
            buttons={true}
            value={g.player.currentChapterIndex}
            onValueChange={index => {
              g.player.jumpTo(index);
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
                height="80"
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
                      80,
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
                    items={state.novel.chapters?.filter(
                      x =>
                        thisState.cText == "" ||
                        x.name
                          .toLowerCase()
                          .indexOf(
                            thisState.cText.toLowerCase()
                          ) !== -1
                    )}
                    container={({ item }) => (
                      <View css="flex row juc:space-between ali:center">
                        <Text
                          css="bold desc"
                          invertColor={true}>
                          {item.name}
                        </Text>
                        <Icon
                          invertColor={true}
                          color={
                            state.book.chapterSettings.find(
                              x =>
                                x.url == item.url
                            )?.isFinished
                              ? "green"
                              : undefined
                          }
                          type="AntDesign"
                          name="checkcircle"
                        />
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
            text: (
              <ActionSheetButton
                height="90"
                btn={
                  <Icon
                    invertColor={true}
                    type="Ionicons"
                    name="settings"
                  />
                }>
                <View css="flex">
                  <TabBar
                    position="Top"
                    scrollHeight={proc(
                      80,
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
                          items={Object.keys(
                            Fonts
                          )}
                          render={item => {
                            return (
                              <Text
                                css="bold desc"
                                invertColor={
                                  true
                                }>
                                {item}
                              </Text>
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
                          onValueChange={fontSize => {
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
                          height="80"
                          items={g.voices}
                          render={item => {
                            return (
                              <Text
                                css="bold desc"
                                invertColor={
                                  true
                                }>
                                {item.name}
                              </Text>
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
                            onValueChange={pitch => {
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
                            onValueChange={rate => {
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
    "player.showPlayer",
    "appSettings"
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
            background-color: ${g.appSettings
              .backgroundColor};
            color: ${invertColor(
              g.appSettings.backgroundColor
            )};
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
        onMenu={(item: any) => {
          // handle later
          alert(item.selection);
        }}
        content={{
          content: `<div id="novel" class="novel">
          ${
            g.player.showPlayer
              ?`<p>${g.player.currentPlaying()?.cleanText()?? ""}</p>`
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
                  text: "copy",
                  icon: "content_copy"
                },
                {
                  text: "translate",
                  icon: "translate"
                },
                {
                  text: "define",
                  icon: "search"
                }
              ]
            }
          ]
        }}
        bottomReched={() => g.player.next()}
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
  const [{ url, parserName }, nav] =
    useNavigation(props);
  const updater = useUpdate();
  const loader = useLoader(true);
  const files = g.files.useFile("json");
  const state = useState({
    novel: {} as DetailInfo,
    parser: g.parser.find(parserName),
    book: {} as Book
  });

  const loadData = async () => {
    try {
      loader.show();
      if (state.novel.url) {
        loader.hide();
        return;
      }
      if (
        !g.player.novel ||
        g.player.novel.url !== url
      ) {
        state.novel =
          parserName == "epub"
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
        state.book = book;
        g.player = new Player(
          state.novel,
          state.book,
          {
            show: () => loader.show(),
            hide: () => loader.hide()
          }
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

  if (parserName == "epub")
    useEffect(() => {
      if (!files.loading) loadData();
    }, [files.loading]);

  useEffect(() => {
    g.isFullScreen = true;
    if (parserName != "epub") loadData();
    return () => {
      g.isFullScreen = false;
      g.player.hooked = false;
      if(g.player.showPlayer && g.player.playing())
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
