import {
  useLoader,
  ItemList,
  TextInput,
  ActionSheetButton,
  Web,
  Slider,
  DropDownLocalList,
  ColorPicker,
  ChapterView,
  ColorSelection,
  PlayerView,
  ContextContainer
} from "../../components/";
import {
  View, Text, Icon, ButtonGroup,
  TabView,
  AlertDialog,
  Button, Modal, CheckBox, TabBar, FormItem, TouchableOpacity
} from "react-native-short-style";
import WebView from "react-native-webview";
import Fonts from "../../assets/Fonts";
import * as React from "react";
import LANGUAGE_TABLE from "react-native-translator/dist/constants/languageMap";
import { ScrollView, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useNavigation, useTimer, useDbHook } from "../../hooks";
import { Player, DetailInfo } from "../../native";
import Header from "../../pages/Header";
import { AppSettings, Book } from "../../db";
import { invertColor, sleep } from "../../Methods";
import { useKeepAwake } from "expo-keep-awake";

const lang: any = {};

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
    "appSettings",
    "player.book.textReplacements"
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
        addCloser={true}
        isVisible={context.player.menuOptions.comment != undefined}
        onHide={() => (context.player.menuOptions.comment = undefined)}
        css={"he-200"}
      >
        <View css="flex mat:20 invert">
          <TextInput
            onChangeText={(x: string) =>
              (context.player.menuOptions.comment = x)
            }
            readOnly={true}
            css="pa:5 bor:2 flg:1 clearboth"
            multiline={true}
            defaultValue={context.player.menuOptions.comment}
          />
        </View>
      </Modal>
      <Modal
        isVisible={context.player.menuOptions.textEdit != undefined}
        onHide={() => (context.player.menuOptions.textEdit = undefined)}
        addCloser={true}
        css="he-80%"
      >
        <ScrollView>
          <View css="flex mat:20 invert">
            <FormItem
              title="TextToEdit">
              <TextInput
                onChangeText={x => (context.player.menuOptions.textEdit.edit = x)}
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  context.player.menuOptions.textEdit?.edit
                }
              />
            </FormItem>
            <FormItem title="EditWith">
              <TextInput
                onChangeText={x =>
                (context.player.menuOptions.textEdit.editWith =
                  x)
                }
                css="pa:5 bor:2 flg:1 he-40"
                multiline={true}
                defaultValue={
                  context.player.menuOptions.textEdit
                    ?.editWith
                }
              />
            </FormItem>
            <FormItem title="Comment">
              <TextInput
                onChangeText={x =>
                (context.player.menuOptions.textEdit.comments =
                  x)
                }
                css="pa:5 bor:2 flg:1"
                multiline={true}
                defaultValue={
                  context.player.menuOptions.textEdit
                    ?.comments
                }
              />
            </FormItem>
            <FormItem title="BackgroundColor" labelPosition="Left">
              <ColorPicker
                value={
                  context.player.menuOptions.textEdit
                    ?.bgColor ?? "#ffffff"
                }
                onComplete={({ hex }: any) =>
                (context.player.menuOptions.textEdit = {
                  ...context.player.menuOptions.textEdit,
                  bgColor: hex
                })
                }
              />
            </FormItem>
            <Button text="Save" css={"ali-center juc-center"} onPress={async () => {
              context.player.book.textReplacements.push(
                context.player.menuOptions.textEdit
              );
              await context.player.book.saveChanges();
              await context.player.clean();
              context.player.menuOptions.textEdit = undefined;
            }} />
          </View>
        </ScrollView>
      </Modal>
      <Modal
        addCloser={true}
        isVisible={
          context.player.menuOptions.textToTranslate != undefined
        }
        onHide={() =>
          (context.player.menuOptions.textToTranslate = undefined)
        }
        css="he-80%"
      >
        <View css="flex mat:20 invert">
          <FormItem title="TranslateTo:" labelPosition="Left">
            <DropDownLocalList
              size={"80%"}
              css={"invert"}
              items={Object.keys(LANGUAGE_TABLE).map(x => { return { label: x, value: x } })}
              render={item => {
                return (
                  <View css="fl-1 bac-transparent juc-center pal-10">
                    <Text css="desc fos:13 invertco">
                      {item.label}
                    </Text>
                  </View>
                );
              }}
              onSelect={language => {
                context.appSettings.lang = language.value;
                context.appSettings.saveChanges();
                return false;
              }}
              selectedValue={
                context.appSettings.lang ?? "English"
              }
            />
          </FormItem>
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
                    context.player.menuOptions.textToTranslate ?? ""
                  )}`
              }}
              contentMode="mobile"
              scalesPageToFit={true}
              originWhitelist={["*"]}
              scrollEnabled={true}
              userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
              setSupportMultipleWindows={false}
              style={
                {
                  flexGrow: 1,
                  zIndex: 70,
                  flex: 1
                }
              }
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              javaScriptEnabled={true}
            />
          </View>
        </View>
      </Modal>

      <Modal
        addCloser={true}
        isVisible={context.player.menuOptions.define != undefined}
        onHide={() => (context.player.menuOptions.define = undefined)}
        css="he-80%"
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
              style={
                {
                  flexGrow: 1,
                  zIndex: 70,
                  flex: 1
                }
              }
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

const Controller = ({ state, ...props }: any) => {
  useDbHook(
    "Chapters",
    item => item.parent_Id === state.book.id,
    () => context.player.currentChapterSettings,
    "audioProgress"
  );

  context.hook(
    "player.showController",
    "player.showPlayer",
    "player._playing",
    "size",
    "appSettings",
    "player.book.textReplacements"
  );

  const oSettings = useRef({
    fonts: Object.keys(Fonts).map(x => { return { label: x, value: x } }),
    fontStyles: [
      "Normal",
      "Italic",
      "Oblique"
    ],
    textAlign: [
      "align-left",
      "align-center",
      "align-justify",
      "align-right"
    ]
  }).current

  const Timer = useTimer(100);

  useEffect(() => {
    if (context.appSettings.lockScreen) context.orientation("LANDSCAPE");

    return () => {
      context.orientation("Default");
    };
  }, []);

  const editSettings = ({
    fontSize,
    fontName,
    ttsModol,
    chunkWords,
    lockScreen,
    ...rest
  }: AppSettings | Record<string, any>) => {
    Timer(() => {
      context.batch(async () => {
        if (fontSize != undefined) {
          context.appSettings.fontSize = fontSize;
          context.appSettings.lineHeight = fontSize * context.lineHeight;
        }

        if (ttsModol != undefined) {
          context.appSettings.ttsModol = ttsModol;
          if (context.tts.loaded) {
            if (context.player.playing())
              context.player.playing(false);
            await context.tts.deinitialize();
          }
        }

        if (chunkWords != undefined) {
          context.appSettings.chunkWords = chunkWords;
          if (context.player.playing()) {
            context.player.playing(false);
          }
        }

        for (let key in rest) {
          context.appSettings[key] = rest[key];
        }

        if (lockScreen != undefined) {
          context.appSettings.lockScreen = lockScreen;
          if (context.appSettings.lockScreen)
            context.orientation("LANDSCAPE");
          else context.orientation("Default");
        }



        await context.appSettings.saveChanges();

        if (rest.useSentenceBuilder) context.player.clean();
      });
    });
  };

  const selectedTTsModel = context.tts.nameList().indexOf(context.appSettings.ttsModol);

  return (
    <>
      <View
        ifTrue={context.player.showController}
        css={`band he:110 bottom maw-100% juc:center ali:center pal:10 par:10 botw:1 invert boc:${invertColor(
          context.appSettings.backgroundColor
        )}`}>

        <ContextContainer stateItem={{ chapterSliderValue: undefined }} globalStateKeys={["player.currentChapterIndex", "player.showController"]} render={(state) => {
          return (<>
            <Text css="desc fos:13">
              {context.player.procent(state.chapterSliderValue)}
            </Text>
            <View css="wi-100% juc:center fld-row position-relative left-1 ali:center">
              <Slider
                renderAboveThumbComponent={undefined}
                css="invert"
                disableTimer={true}
                buttons={true}
                value={state.chapterSliderValue == undefined ? context.player.currentChapterIndex : state.chapterSliderValue}
                onValueChange={(v: number) => {
                  Timer.clear();
                  state.chapterSliderValue = parseInt(v.toString()) as any
                }}
                animationType="spring"
                onSlidingComplete={(index: number) => {
                  Timer(async () => {
                    await context.player.jumpTo(parseInt(index.toString()));
                    state.chapterSliderValue = undefined;
                  });
                }}
                minimumValue={0}
                maximumValue={context.player.novel.chapters.length}
              />
            </View></>)
        }} />

        <View css="clearwidth maw-95% overflow-hidden ali:center juc:center ">
          <Text
            numberOfLines={1}
            css="header bold fos:16 fontStyle:italic invertco">
            {state.book.name}
          </Text>
          <Text numberOfLines={1} css="desc color:red fos-12">
            {context.player.currentChapterSettings?.name}
          </Text>
        </View>
      </View>
      <Header
        ifTrue={context.player.showController}
        css={`absolute to:0 bobw:1 he-45 boc:${invertColor(
          context.appSettings.backgroundColor
        )}`}
        buttons={[
          {
            ifTrue: !(context.player.novel.type?.isManga() ?? false),
            text: (
              <Icon
                name="featured-play-list"
                type="MaterialIcons"
                css="fos-35"
              />
            ),
            press: () => {
              context.player.playing(false);
              context.player.showPlayer = !context.player.showPlayer;
            }
          },
          {
            text: (
              <ActionSheetButton
                ready={false}
                title="Chapters"
                size="80%"
                btn={
                  <Icon
                    type="MaterialCommunityIcons"
                    name="menu"
                    css="fos-35"
                  />
                }
              >
                <ContextContainer
                  globalStateKeys={["player.currentChapter"]}
                  render={() => (
                    <ChapterView
                      book={state.book}
                      novel={state.novel}
                      onPress={async item => {
                        await context.player.jumpTo(item.url);
                      }}
                      current={context.player.currentChapter.url}
                    />
                  )}
                />

              </ActionSheetButton>
            )
          },
          {
            text: () => (
              <ActionSheetButton
                size="80%"
                btn={
                  <Icon
                    type="Ionicons"
                    name="settings"
                    css="fos-35"
                  />
                }
              >
                <View css="flex">
                  <TabBar lazyLoading={true} position="Top" header={{
                    style: "invert",
                    overlayStyle: {
                      content: context.selectedThemeIndex == 1 ? "bac-#000" : "bac-#CCCCCC"
                    }
                  }}>
                    <TabView
                      icon={{
                        name: "format-font",
                        type: "MaterialCommunityIcons"
                      }}
                      css="invert"
                    >
                      <FormItem title="LockScreen:" labelPosition="Left">
                        <CheckBox
                          css="pal:1 invert"
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
                      </FormItem>
                      <FormItem title="NavigationMethod" ifTrue={() => !(state.novel.type?.isManga())}>
                        <ButtonGroup
                          buttons={["Scroll", "Snap", "ScrollSnap"]}
                          onPress={(_, items) => {
                            editSettings({
                              navigationType: items[0]
                            });
                          }}
                          selectedIndex={[context.appSettings.navigationType == "Scroll" ? 0 : (context.appSettings.navigationType == "ScrollSnap" ? 2 : 1)]}
                        />
                      </FormItem>
                      <FormItem title="FontStyle" ifTrue={() => !(state.novel.type?.isManga())}>
                        <ButtonGroup
                          buttons={oSettings.fontStyles}
                          onPress={(_, items) => {
                            editSettings({
                              fontStyle: items[0].toLowerCase()
                            });
                          }}
                          selectedIndex={(
                            [oSettings.fontStyles.findIndex(x => x.toLowerCase() == context.appSettings.fontStyle?.toLowerCase())].filter(x => x >= 0)
                          )}
                        />
                      </FormItem>
                      <FormItem title="TextAlign" ifTrue={() => !(state.novel.type?.isManga())}>
                        <ButtonGroup
                          buttons={oSettings.textAlign}
                          onPress={(_, items) => {
                            editSettings({
                              textAlign:
                                items[0].safeSplit(
                                  "-",
                                  1
                                )
                            });
                          }}
                          render={(x, i) => (
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
                                  : { color: "gray" })
                              }}
                            />)
                          }
                          selectedIndex={[oSettings.textAlign.findIndex(x => x.has(context.appSettings.textAlign))].filter(x => x >= 0)}
                        />
                      </FormItem>


                      <FormItem title="Font" ifTrue={() => !(state.novel.type?.isManga())}>
                        <DropDownLocalList
                          size={"80%"}
                          css={"invert"}
                          items={oSettings.fonts}
                          render={item => {
                            return (
                              <View
                                css={`bac:transparent ali:center pal:10 bor:5 flex row juc:space-between he-30`}>
                                <Text css={`header invertco fontFamily-${item.value}`}>
                                  {item.label}
                                </Text>
                              </View>
                            );
                          }}
                          onSelect={fontName => {
                            editSettings({
                              fontName: fontName.value
                            });
                            return false;
                          }}
                          selectedValue={
                            context.appSettings.fontName || "SourceSans3-Black"
                          }
                        />
                      </FormItem>
                      <FormItem title="FontSize" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .fontSize
                          }
                          onSlidingComplete={(fontSize: any) => {
                            editSettings({
                              fontSize
                            });
                          }}
                          minimumValue={10}
                          maximumValue={40}
                        />
                      </FormItem>

                      <FormItem title="LineHeight" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .lineHeight
                          }
                          onSlidingComplete={(lineHeight: any) => {
                            editSettings({
                              lineHeight
                            });
                          }}
                          minimumValue={Math.max((context.appSettings.fontSize * context.lineHeight) - 20, 10)}
                          maximumValue={(context.appSettings.fontSize * context.lineHeight) + 20}
                        />
                      </FormItem>

                      <FormItem title="Sentence Margin" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .sentenceMargin ?? 5
                          }
                          onSlidingComplete={(sentenceMargin: any) => {
                            editSettings({
                              sentenceMargin
                            });
                          }}
                          minimumValue={5}
                          maximumValue={15}
                        />
                      </FormItem>

                      <FormItem title="Padding" ifTrue={() => !(state.novel.type?.isManga())}>
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          value={
                            context.appSettings
                              .margin
                          }
                          onSlidingComplete={(margin: any) => {
                            editSettings({
                              margin
                            });
                          }}
                          minimumValue={5}
                          maximumValue={40}
                        />
                      </FormItem>
                      <View css="flg-1 fl-0 wi-100% mat-10 invert">
                        <Text css="fow-bold">BackgroundColor</Text>
                        <ColorSelection selectedValue={context.appSettings.backgroundColor} onChange={(hex) => {
                          editSettings({
                            backgroundColor: hex
                          })
                        }} />

                      </View>
                    </TabView>
                    <TabView
                      ifTrue={() => !(state.novel.type?.isManga())}
                      css="flex invert"
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
                      <FormItem ifTrue={() =>
                        context.player.book
                          .parserName !== "epub"
                      } title="UseSentenceBuilder:" labelPosition="Left">
                        <CheckBox
                          css="pal:1 invert"
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
                        />
                      </FormItem>
                      <FormItem
                        title="MinLength"
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
                          onSlidingComplete={(length: any) => {
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
                      </FormItem>
                      <FormItem title="Add Shadow:" labelPosition="Left">
                        <CheckBox
                          css="pal:1 invert"
                          checked={
                            context.appSettings.use3D ?? false
                          }
                          onChange={() => {
                            editSettings({
                              use3D: !context
                                .appSettings.use3D
                            });
                          }}
                        />
                      </FormItem>
                      <FormItem
                        title="Shadow Length"
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
                          onSlidingComplete={(shadowLength: any) => {
                            editSettings({
                              shadowLength
                            });
                          }}
                          minimumValue={1}
                          maximumValue={3}
                        />
                      </FormItem>
                      <FormItem
                        css="he:200 "
                        title="InlineStyle"
                        labelPosition="Top"
                      >
                        <TextInput
                          isModole={true}
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
                      </FormItem>
                    </TabView>
                    <TabView
                      ifTrue={() => !(state.novel.type?.isManga())}
                      css="flex invert"
                      icon={{
                        name: "settings-voice",
                        type: "MaterialIcons"
                      }}
                    >
                      <FormItem css="mih-130" title="Voices Choose TTS Model">
                        <View css="he-100%">
                            <Text css="note co-red fos-12 fow-bold wi-100% pal-10 mab-10">For older phones, try using the low models as those tend to be faster.</Text>
                          <ButtonGroup scrollable={false}
                            buttons={context.tts.nameList()}
                            selectedIndex={[selectedTTsModel == -1 ? 1 : selectedTTsModel]}
                            onPress={x => {
                              editSettings({ ttsModol: context.tts.nameList()[x[0]] })
                            }} />
                        </View>
                      </FormItem>
                      <FormItem title="Split Words into chunks">
                        <Text css="note co-red fos-12 fow-bold wi-100% pal-10">Split sentences into chunks, This is optional if you have an old phone.</Text>
                        <CheckBox
                          css="pal:1 invert"
                          checked={
                            context.appSettings
                              .chunkWords ?? false
                          }
                          onChange={() => {
                            editSettings({
                              chunkWords: !(context.appSettings.chunkWords ?? false)
                            });
                          }}
                        />
                      </FormItem>
                      <FormItem title="Rate/Speed">
                        <Slider
                          css="flex"
                          renderValue={true}
                          invertColor={true}
                          buttons={true}
                          step={0.1}
                          value={
                            context.appSettings.rate
                          }
                          onSlidingComplete={(rate: any) => {
                            editSettings({
                              rate
                            });
                          }}
                          minimumValue={0.5}
                          maximumValue={2}
                        />
                      </FormItem>
                    </TabView>
                    <TabView
                      ifTrue={() => !(state.novel.type?.isManga())}
                      css="flex invert"
                      icon={{
                        name: "format-color-highlight",
                        type: "MaterialCommunityIcons"
                      }}
                    >
                      <View css="flex clearboth juc:flex-start mih:100 invert">
                        <Text css="header fos:18">
                          Text Replacements
                        </Text>
                        <ItemList
                          items={context.player.book.textReplacements}
                          container={({ item }: any) => (
                            <View
                              style={{
                                backgroundColor:
                                  item.bgColor
                              }}
                              css="flex di:flex row juc:space-between ali:center pal:10 bor:2"
                            >
                              <View css="flex overflow maw:80% clb">
                                <Text css="desc fos:13">
                                  {item.edit}
                                  {"\n=>"}
                                </Text>
                                <Text
                                  css="desc fos:13">
                                  {
                                    item.editWith
                                  }
                                </Text>
                              </View>
                              <Button text="Delete" onPress={async () => {
                                context.player.show();
                                context.player.book.textReplacements = context.player.book.textReplacements.filter(x => x != item);

                                await context.player.book.saveChanges();
                                await context.player.clean();
                                context.player.hide();
                              }}></Button>
                            </View>
                          )}
                          itemCss="pa:5 clearwidth bobw:1 boc:gray"
                          vMode={true}
                        />
                      </View>
                    </TabView>
                  </TabBar>
                </View >
              </ActionSheetButton >
            )
          }
        ]}
        {...props}
      />
    </>
  );
};
const InternalWeb = ({ state, ...props }: any) => {
  const loader = context.player.usePlayerLoader();
  return (
    <>
      {loader.elem}
      <Web
        click={() => {
          context.player.showController = !context.player.showController;
        }}
        onComments={(index: number) => {
          context.player.menuOptions.comment = context.player.book.textReplacements[index].comments;
        }}
        onMenu={async (item: any) => {
          // handle later
          if (item.text == "Translate")
            context.player.menuOptions.textToTranslate = item.selection;
          else if (item.text === "Copy") {
            Clipboard.setStringAsync(item.selection);
          } else if (item.text === "Define") {
            context.player.menuOptions.define = `https://www.google.com/search?q=define%3A${item.selection.replace(/ /g, "+")}&sca_esv=ae00ca4afbc9d4da&sxsrf=ACQVn09Tncl4Kw9jpIkzEAaZtuZjWgKj5Q%3A1708602991908&ei=bzbXZcP_Ns2mwPAPpd2WiAU&oq=define%3Asystem&gs_lp=EhNtb2JpbGUtZ3dzLXdpei1zZXJwIg1kZWZpbmU6c3lzdGVtSI9sUM4IWI5ocAJ4AZABAZgB4QGgAfMSqgEGMjAuNC4xuAEDyAEA-AEBqAIPwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAPCAhMQLhiABBiKBRhDGMcBGNEDGLADwgIKECMYgAQYigUYJ8ICCBAAGIAEGMsBwgIHECMY6gIYJ8ICBBAjGCfCAgoQABiABBiKBRhDwgIUEC4YgAQYigUYsQMYgwEYxwEYrwHCAgsQABiABBixAxiDAcICCBAAGIAEGLEDwgIOEC4YgAQYxwEYrwEYjgXCAg4QLhiABBiKBRixAxiDAcICCBAuGIAEGLEDwgIFEAAYgATCAgQQABgDwgIHEAAYgAQYCogGAZAGEQ&sclient=mobile-gws-wiz-serp`;
          } else if (item.text === "Edit") {
            context.player.menuOptions.textEdit = {
              edit: item.selection,
              bgColor: undefined,
              comments: undefined,
              editWith: item.selection
            };
          } else if (item.text === "Delete" && item.selection && item.selection.length > 1) {
            context.player.book.textReplacements.push(
              {
                edit: item.selection,
                bgColor: undefined,
                comments: undefined,
                editWith: ""
              }
            );
            await context.player.book.saveChanges();
            await context.player.clean();
          }
        }}
        menuItems={{
          selector: "#novel",
          minlength: 2,
          items: [
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
            },
            {
              text: "Delete",
              icon: "delete"
            },
            {
              text: "Edit",
              icon: "edit_note"
            }
          ]
        }}
        bottomReched={() => {
          if (!context.player.isloading)
            context.player.next(true)
        }}
        topReched={() => {
          if (!context.player.isloading)
            context.player.prev()
        }
        }
        onScroll={(y: number) => {
          if (context.player.isloading)
            return;
          context.player.currentChapterSettings.readPercent = context.player.scrollProcent;
          context.player.currentChapterSettings.scrollProgress = y;
          context.player.currentChapterSettings.saveChanges();
        }}
      />
    </>
  );
};

export default (props: any) => {
  const [{ name, url, parserName, epub, chapter }, nav] = useNavigation(props);
  const loader = useLoader(true);
  useKeepAwake();
  const files = context.files.useFile<DetailInfo>(
    "json",
    x => {
      return x.has(
        "".fileName(name, parserName)
      );
    },
    "New"
  );
  const state = buildState(() =>
  (
    {
      novel: {} as DetailInfo,
      parser: context.parser.find(parserName),
      book: {} as Book,
      ready: false
    })).ignore(
      "book",
      "parser",
      "novel"
    ).build();

  // context.hook("appSettings.backgroundColor");

  const loadData = async () => {
    await context.dbBatch(async () => {
      await state.batch(async () => {
        try {
          loader.show();
          if (state.novel.url) {
            return;
          }
          state.novel = parserName == "epub" || epub
            ? files.fileItems.find(x => x.url === url) as DetailInfo
            : await state.parser?.detail(url, true);

          if (!state.novel || !state.novel.name)
            return;
          if (context.player._playing)
            context.player.playing(false);
          if (
            !context.player.novel ||
            context.player.novel.url !== url ||
            context.player.isEpup != (epub === true)
          ) {
            context.player = undefined as any;
            let book = await context
              .db.Books.query.load("chapterSettings")
              .where.column(x => x.url)
              .equalTo(url)
              .and.column(x => x.parserName).equalTo(parserName)
              .findOrSave(
                Book.n()
                  .Url(state.novel.url)
                  .Name(state.novel.name)
                  .ParserName(parserName)
                  .ImageBase64(await context.http().imageUrlToBase64(state.novel.image)));

            if (!book.textReplacements) book.textReplacements = [];
            state.book = book;

            context.player = new Player(
              state.novel,
              state.book,
              epub === true
            );
            await context.player.jumpTo(chapter);
          } else {
            context.player.novel = state.novel = state.novel;
            state.book = context.player.book;
            context.player.hooked = true;
            context.player.viewState = "Default";
            await context.player.jumpTo(chapter);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (loader.loading)
            loader.hide();
          state.ready = true;
        }
      });
    });
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
    if (context.player?.networkError) {
      AlertDialog
        .confirm(
          {
            css: "he-50%",
            message: `Something went wrong as the chapter could not be retrieved. Please check your internet connection.\nWould you like to retry`,
            title: "Error"
          }
        )
        .then(answer => {
          if (answer) context.player.jumpTo();
        });
    }
  }, "player.networkError");

  const loading = (!state.ready || (loader.loading && (!state.novel.name || !context.player?.currentChapterSettings)));

  return (
    <>
      {loader.elem}

      <View
        css="flex"
        style={{
          zIndex: 100,
          backgroundColor: loading ? context.appSettings.backgroundColor : "transparent"
        }}
      >
        {!loading && context.player?.currentChapterSettings ? (
          <>
            <Modoles />
            <Controller state={state} {...props} />
            <InternalWeb state={state} {...props} />
            <PlayerView />
          </>
        ) : null}
      </View>
    </>
  );
};
