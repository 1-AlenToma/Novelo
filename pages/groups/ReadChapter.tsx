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
  useUpdate
} from "../../hooks";
import {
  useState,
  Player,
  DetailInfo
} from "../../native";
import g from "../../GlobalContext";
import Header from "../../pages/Header";
import { Book, Chapter } from "../../db";
import WebView from "react-native-webview";
import script from "../../assets/readerjs";
import {
  arrayBuffer,
  newId,
  proc,
  invertColor
} from "../../Methods";
import { Asset, useAssets } from "expo-asset";
import * as FileSystem from "expo-file-system";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider
} from "reanimated-color-picker";

const BColorPicker = ({
  onChange,
  value
}: any) => {
  const state = useState({
    showColor: false
  });
  return (
    <View css="wi:90% he:20">
      <TouchableOpacity
        onPress={() =>
          (state.showColor = !state.showColor)
        }
        style={{ backgroundColor: value }}
        css="flex juc:center ali:center">
        <Text
          css="desc bold"
          style={{ color: invertColor(value) }}
          invertColor={true}>
          {value}
        </Text>
      </TouchableOpacity>
      <Modal
        height="90"
        visible={state.showColor}
        onHide={() => (state.showColor = false)}>
        <View css="flex juc:center ali:center">
          <ColorPicker
            style={{ width: "70%" }}
            value={value}
            onComplete={({ hex }) =>
              onChange(hex)
            }>
            <Preview />
            <Panel1 />
            <HueSlider />
          </ColorPicker>
        </View>
      </Modal>
    </View>
  );
};

const Controller = ({ state, ...props }) => {
  g.hook("player.showController", "appSettings");
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
    lockScreen
  }: any) => {
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
    if (fontName)
      g.appSettings.fontName = fontName;

    await g.db().save(g.appSettings);
  };

  return (
    <>
      <View
        ifTrue={g.player.showController}
        css="band bottom juc:space-between ali:center row pal:10 par:10"
        invertColor={true}>
        <Text
          invertColor={true}
          css="header bold fos:18 foso:italic">
          {g.player.currentChapterSettings?.name}
        </Text>
        <Text
          invertColor={true}
          css="header bold fos:18 foso:italic">
          {g.player.procent}
        </Text>
      </View>
      <Header
        ifTrue={g.player.showController}
        css="absolute to:0"
        buttons={[
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
                <View css="clearboth flex juc:flex-start">
                  <TabBar position="Top">
                    <View
                      title="Settings"
                      css="clearboth">
                      <View css="form">
                        <Text invertColor={true}>
                          Font:
                        </Text>
                        <DropdownList
                          height="50"
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
                        <BColorPicker
                          value={
                            g.appSettings
                              .backgroundColor
                          }
                          onChange={v => {
                            editSettings({
                              backgroundColor: v
                            });
                          }}
                        />
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
                    <View title="Voice"></View>
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
  g.hook(
    "player.currentChapterSettings.content",
    "appSettings"
  );

  return (
    <>
      <Web
        fontName={g.appSettings.fontName}
        css={`
          * {
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
            height: 100%;
            overflow-x: hidden;
            text-align-vertical: top;
            padding-bottom: ${g.player
              .paddingBottom}px;
            padding-top: ${g.player.paddingTop}px;
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
          content: `<div class="novel">
      ${g.player.currentChapterSettings.content}
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
        bottomReched={() => g.player.next}
        topReched={() => g.player.prev}
        onScroll={async (y: number) => {
          g.player.currentChapterSettings.scrollProgress =
            y;
            console.log(y)
         await g.db().save(
            g.player.currentChapterSettings
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
  const state = useState({
    novel: {} as DetailInfo,
    parser: g.parser.find(parserName),
    book: {} as Book
  });

  useEffect(() => {
    g.isFullScreen = true;
    (async () => {
      try {
        loader.show();
        state.novel =
          await state.parser.detail(url);
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
      } catch (e) {
        console.error(e);
      } finally {
        // loader.hide();
      }
    })();
    return () => {
      g.isFullScreen = false;
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
