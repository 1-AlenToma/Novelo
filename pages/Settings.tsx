import {
  TabBar,
  Text,
  View,
  TouchableOpacity,
  Icon,
  ProgressBar,
  Modal,
  CheckBox,
  ItemList,
  Image,
  useLoader,
  DropdownList,
  Form
} from "../components/";
import * as Updates from "expo-updates";
import { Book, Chapter } from "..db";
import {
  Platform,
  ScrollView
} from "react-native";
import { clearStyles } from "../styles";
import { useState } from "../native";
import { getDirectoryPermissions } from "../Methods";
import * as DocumentPicker from "expo-document-picker";

export default (props: any) => {
  let loader = useLoader();
  context.hook("theme.themeMode");
  const { fileItems, elem } = context
    .files()
    .useFile("json", undefined, "NewDelete");
  const [books, dataIsLoading] = context
    .db()
    .useQuery(
      "Books",
      context
        .db()
        .querySelector<Book>("Books")
        .LoadChildren<Chapter>(
          "Chapters",
          "parent_Id",
          "id",
          "chapterSettings",
          true
        )
        .Where.Column(x => x.favorit)
        .EqualTo(true)
    );
  const state = useState({
    procent: 0,
    downloadShow: false,
    all: false,
    appSettings: false,
    epubs: false,
    items: []
  });

  const download = async () => {
    state.downloadShow = false;
    loader.show();
    await context.dbContext().downloadDatabase({
      ...state
    });
    loader.hide();
    context.alert("File Downloded").show();
  };

  const cleanData = () => {
    context
      .alert("Are you sure?", "Please Confirm")
      .confirm(async answer => {
        try {
          if (!answer) return;
          loader.show();

          let _books = context
            .db()
            .querySelector<Book>("Books")
            .Where.Column(x => x.favorit)
            .EqualTo(false)
            .AND.Column(x => x.parserName)
            .NotEqualTo("epub");
          // skip deleting downloaded files
          let ids = (await _books.toList())
            .filter(
              x =>
                !fileItems.find(
                  f => x.url == f.url
                )
            )
            .map(x => x.id);
          if (ids.length > 0)
            await g
              .db()
              .querySelector<Chapter>("Chapters")
              .Where.Column(x => x.parent_Id)
              .IN(ids)
              .delete();
          await _books.delete();
          let cacheFiles = await context
            .cache()
            .allFiles();
          for (let f of cacheFiles) {
            await context.cache().delete(f);
          }
        } catch (e) {
          console.error(e);
        }

        loader.hide();
      });
  };

  const uploadBackup = async () => {
    const { assets } =
      await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "application/json"
      });
    loader.show();
    let uri = assets?.firstOrDefault("uri");
    let msg = await context
      .dbContext()
      .uploadData(uri, p => {
        state.procent = p;
      });
    loader.hide();
    if (msg) context.alert(msg);
  };

  const itemPress = (item: any) => {
    if (
      state.items.find(
        x =>
          x.url === item.url &&
          x.parserName == item.parserName
      )
    ) {
      state.items = [
        ...state.items.filter(
          x =>
            x.url !== item.url &&
            x.parserName != item.parserName
        )
      ];
    } else state.items = [...state.items, item];
  };

  return (
    <View css="flex">
      {loader.elem ?? elem}
      <Modal
        height="90"
        onHide={() =>
          (state.downloadShow =
            !state.downloadShow)
        }
        visible={state.downloadShow}
        title="Backup options">
        <View css="clearwidth ali:center bottom bo:10 zi:10">
          <TouchableOpacity
            css="button"
            onPress={download}>
            <Text
              invertColor={true}
              css="fos:15 bold">
              DOWNLOAD
            </Text>
          </TouchableOpacity>
        </View>
        <View css="pat:10">
          <CheckBox
            text="Include FontSettings:"
            invertColor={true}
            checked={state.appSettings}
            onChange={() =>
              (state.appSettings =
                !state.appSettings)
            }
          />

          <CheckBox
            text="Include Epubs:"
            invertColor={true}
            checked={state.epubs}
            onChange={() =>
              (state.epubs = !state.epubs)
            }
          />
          <CheckBox
            text="Include All novels:"
            invertColor={true}
            checked={state.all}
            onChange={() =>
              (state.all = !state.all)
            }
          />
          <Form
            ifTrue={!state.all}
            text="Favorit Novels"
            root={true}
            css="mat:20 mih:100 mah:70%">
            <ItemList
              updater={[state.items]}
              onPress={item => {
                itemPress(item);
                //state.all = false;
              }}
              items={books}
              container={({ item }) => (
                <CheckBox
                  text={item.name + ":"}
                  invertColor={true}
                  checked={state.items.find(
                    x =>
                      x.url === item.url &&
                      x.parserName ==
                        item.parserName
                  )}
                />
              )}
              vMode={true}
            />
          </Form>
        </View>
      </Modal>
      <View
        ifTrue={
          state.procent > 0 && state.procent < 100
        }
        css="he:30 clearwidth">
        <ProgressBar procent={state.procent} />
      </View>
      <View
        invertColor={true}
        css="mih:99% ali:center bor:5 overflow">
        <View css="he:30% juc:center ali:center">
          <Image
            resizeMode="contain"
            url={require("../assets/ic_launcher_round.png")}
            css="mat:2.5 clearwidth bor:2 miw:100 mih:100"
          />
        </View>
        <TouchableOpacity
          css="settingButton"
          onPress={() =>
            (state.downloadShow = true)
          }>
          <Icon
            invertColor={true}
            type="MaterialCommunityIcons"
            name="database-import"
          />
          <Text invertColor={true}>
            Download Backup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          css="settingButton"
          onPress={uploadBackup}>
          <Icon
            invertColor={true}
            type="MaterialCommunityIcons"
            name="database-export"
          />
          <Text invertColor={true}>
            Upload Backup
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          css="settingButton"
          onPress={cleanData}>
          <Icon
            invertColor={true}
            type="MaterialIcons"
            name="cleaning-services"
          />
          <Text
            css="he:30"
            invertColor={true}>
            Clean files
            {"\n"}
            <Text css="co:red desc">
              Remove all none favorits novels from
              cache and db
            </Text>
          </Text>
        </TouchableOpacity>

        <View css="settingButton">
          <Icon
            invertColor={true}
            type="MaterialCommunityIcons"
            name="theme-light-dark"
          />
          <DropdownList
            invertColor={true}
            height={200}
            toTop={true}
            selectedIndex={
              context.appSettings.theme == "dark"
                ? 1
                : 0
            }
            updater={[context.appSettings.theme]}
            hooks={["appSettings.theme"]}
            items={["light", "dark"]}
            render={item => {
              return (
                <View
                  css={`
                    ${item ==
                    context.appSettings.theme
                      ? "selectedRow"
                      : ""} ali:center pal:10 bor:5 flex row juc:space-between mih:24
                  `}>
                  <Text
                    css={`desc fos:13`}
                    invertColor={true}>
                    {item.displayName()}
                  </Text>
                </View>
              );
            }}
            onSelect={async theme => {
              context.appSettings.theme = theme;
              await context.appSettings.saveChanges();
              context.theme.themeMode = theme;
              //Updates.reloadAsync();
            }}
            selectedValue={(
              context.appSettings.theme ?? "light"
            ).displayName()}
          />
        </View>
      </View>
    </View>
  );
};
