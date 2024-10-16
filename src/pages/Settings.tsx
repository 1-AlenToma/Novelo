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
import * as React from "react";
import { Book, Chapter } from "../db";
import { useLocationSelection, AppUpdate } from "../hooks";
import * as DocumentPicker from "expo-document-picker";


export default (props: any) => {
  let loader = useLoader();
  context.hook("theme.themeMode");
  const dataLocation = useLocationSelection();
  context.zip.on("Loading")
  const { fileItems, elem } = context
    .files
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
  const state = buildState(
    {
      all: true,
      appSettings: true,
      epubs: true,
      items: [] as any[],
      added: {}
    }
  ).ignore("items").build();

  const download = async () => {
    const location = await context.browser.pickFolder("Select where to save the backup file");
    if (!location)
      return;
    loader.show();
    await context.dbContext().downloadDatabase(location.path, {
      ...state
    });
    loader.hide();
    context.alert("File downloaded to " + context.zip._fullPath, "Success").show();
    // context.notification.push("File Downloaded", context.zip._fullPath ?? "", { data: context.zip._fullPath, type: "File" })

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
            await context
              .db()
              .querySelector<Chapter>("Chapters")
              .Where.Column(x => x.parent_Id)
              .IN(ids)
              .delete();
          await _books.delete();
          await context.cache.deleteDir();
          await context.cache.checkDir();



        } catch (e) {
          console.error(e);
        }

        loader.hide();
      });
  };

  const uploadBackup = async () => {
    let uri = await context.browser.pickFile(["zip"], "Select the backup file");
    if (!uri)
      return;
    loader.show();
    let msg = await context
      .dbContext()
      .uploadData(uri.path);
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
      state.items = state.items.filter(
        x =>
          x.url !== item.url &&
          x.parserName === item.parserName
      );
    } else state.items = [...state.items, item];
    state.added = state.items.reduce((c, v) => {
      c[v.url + v.parserName] = true;
      return c;
    }, {});
  };



  return (
    <View css="flex">
      
      <View
        ifTrue={
          context.zip._loading
        }
        css="he:30 clearwidth zi:99999">
        <context.zip.ProgressBar />
      </View>
      {loader.elem ?? elem}
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
        {dataLocation.elem}
        <AppUpdate />
        <TouchableOpacity
          css="settingButton"
          onPress={download}>
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
            onSelect={theme => {
              context.appSettings.theme = theme;

              context.theme.themeMode = theme;
              context.appSettings.saveChanges();
              //Updates.reloadAsync();
            }}
            selectedValue={(
              context.appSettings.theme ?? "dark"
            ).displayName()}
          />
        </View>
      </View>
    </View >
  );
};
