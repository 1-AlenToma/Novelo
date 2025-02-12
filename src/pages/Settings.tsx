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
  AlertDialog,
} from "../components/";
import * as React from "react";
import { Book, Chapter } from "../db";
import { useLocationSelection, AppUpdate } from "../hooks";
import WebNovelTester from "../components/WebNovelTester";


export default (props: any) => {
  let loader = useLoader();
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
      added: {},
      showWebTester: false
    }
  ).ignore("items").build();
  context.hook("selectedThemeIndex");

  const download = async () => {
    const location = await context.browser.pickFolder("Select where to save the backup file");
    if (!location)
      return;
    loader.show();
    await context.dbContext().downloadDatabase(location.path, {
      ...state
    });
    loader.hide();
    AlertDialog.alert({ message: "File downloaded to " + context.zip._fullPath, title: "Success" });
    // context.notification.push("File Downloaded", context.zip._fullPath ?? "", { data: context.zip._fullPath, type: "File" })

  };

  const cleanData = () => {
    AlertDialog
      .confirm({ message: "Are you sure?", title: "Please Confirm" })
      .then(async answer => {
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
    if (msg) AlertDialog.alert({ message: msg });
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
    <View css="flex clb">
      <Modal css="he-80%" isVisible={state.showWebTester} onHide={() => state.showWebTester = false} addCloser={true}>
        <WebNovelTester />
      </Modal>
      <View
        ifTrue={
          context.zip._loading
        }
        css="he:30 clearwidth zi:99999 clb">
        <context.zip.ProgressBar />
      </View>
      {loader.elem ?? elem}
      <View
        css="mih:99% ali:center bor:5 overflow invert">
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
          css="invert settingButton"
          onPress={download}>
          <Icon
            type="MaterialCommunityIcons"
            name="database-import"
            css="invertco"
          />
          <Text>
            Download Backup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          css="invert settingButton"
          onPress={uploadBackup}>
          <Icon
            type="MaterialCommunityIcons"
            name="database-export"
            css="invertco"
          />
          <Text>
            Upload Backup
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          css="invert settingButton"
          onPress={cleanData}>
          <Icon
            type="MaterialIcons"
            name="cleaning-services"
            css="invertco"
          />
          <Text>
            Clean files
            {"\n"}
            <Text css="co:red desc">
              Remove all none favorits novels from
              cache and db
            </Text>
          </Text>
        </TouchableOpacity>

        <View css="settingButton invert">
          <Icon
            type="MaterialCommunityIcons"
            name="theme-light-dark"
            css="invertco"
          />
          <DropdownList
            mode="Modal"
            selectedValue={context.selectedThemeIndex}
            css="invert wi-90%"
            size={120}
            items={[{ label: "Light", value: 0, }, { label: "Dark", value: 1 }]}
            render={item => {
              return (
                <View
                  css={`
                     ali:center bac:transparent pal:10 bor:5 flex row juc:space-between mih:24 clb
                  `}>
                  <Text
                    css={`desc fos:13 invertco`}>
                    {item.label}
                  </Text>
                </View>
              );
            }}
            onSelect={theme => {
              context.appSettings.selectedTheme = theme.value;

              context.selectedThemeIndex = theme.value;
              context.appSettings.saveChanges();
              //Updates.reloadAsync();
            }}
          />
        </View>
        <TouchableOpacity
          css="invert settingButton"
          onPress={()=> state.showWebTester= true}>
          <Icon
            type="MaterialCommunityIcons"
            name="database-import"
            css="invertco"
          />
          <Text>
            Test Parser (Developers only)
          </Text>
        </TouchableOpacity>

      </View>
    </View >
  );
};
