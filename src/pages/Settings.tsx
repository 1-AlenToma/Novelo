import {
  Image,
  useLoader,
  DropDownLocalList,
  AppServer,
} from "../components/";
import { View, Text, Icon, AlertDialog, Modal, TouchableOpacity, CheckBox, FormItem } from "react-native-short-style";
import * as React from "react";
import { useLocationSelection, AppUpdate } from "../hooks";
import WebNovelTester from "../components/WebNovelTester";


export default (props: any) => {
  let loader = useLoader();
  const dataLocation = useLocationSelection();
  context.zip.on("Loading")
  const state = buildState(() =>
  (
    {
      all: true,
      appSettings: true,
      epubs: true,
      items: [] as any[],
      added: {},
      showWebTester: false
    }
  )).build();
  context.hook("selectedThemeIndex");

  const download = async () => {
    const location = await context.browser.pickFolder("Select where to save the backup file", ["zip"]);
    if (!location)
      return;
    loader.show();
    await context.db.downloadDatabase(location.path, {
      ...state
    });
    loader.hide();
    AlertDialog.alert({ message: "File downloaded to " + context.zip._fullPath, title: "Success" });
    // context.notification.push("File Downloaded", context.zip._fullPath ?? "", { data: context.zip._fullPath, type: "File" })

  };

  const cleanData = () => {
    AlertDialog
      .confirm({ message: "Are you sure?", title: "Please Confirm" })
      .then(async (answer: boolean) => {
        try {
          if (!answer) return;
          loader.show();

          let _books = context
            .db.Books.query
            .where.column(x => x.favorit)
            .equalTo(false)
            .and.column(x => x.parserName)
            .notEqualTo("epub");

          await _books.delete();
          console.warn("deleting cache")
          await context.cache.deleteDir();
          await context.cache.checkDir();
          context.parser.set(context.parser.current);// update the parser which will trigger load
          console.warn("Cache Deleted")



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
    let msg = await context.db.uploadData(uri.path);
    loader.hide();
    if (msg) AlertDialog.alert({ message: msg });
    else AlertDialog.toast({ message: "Data has been imported", type: "Success", title: "FileUpload" })
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
    <View css="flex clb ma-5">
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
      {loader.elem}
      <View
        css="mih:99% ali:center bor:5 overflow invert">
        <View css="he:30% juc:center ali:center">
          <Image
            url={require("../assets/ic_launcher_round.png")}
            css="mat:2.5 clearwidth bor:2 miw:100 mih:100"
          />
          <Text css="desc co-red fow-bold">Version:{context.versionName}</Text>
        </View>
        {dataLocation.elem}
        <AppUpdate />
        <AppServer />
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

        <View css="invert settingButton">
          <Icon
            type="MaterialCommunityIcons"
            name="update"
            css="invertco"
          />
          <Text css="maw-70%">
            AutoUpdate favorit novels
            {"\n"}
            <Text css="co:red desc">
              This will update the chapters in favorit, each 5 dayes when you open favorit tab.{"\n"}
              This could be demanding if you have many novels in favorit tab.{"\n"}
              Recommend to disable this and use refresh on those novels/manga you like.
            </Text>
          </Text>
          <CheckBox css="als-center _abc ri-10" checkBoxType="Switch" checked={context.appSettings.autoUpdateFavoritNovels ?? false} onChange={() => {
            context.appSettings.autoUpdateFavoritNovels = !context.appSettings.autoUpdateFavoritNovels;
            context.appSettings.saveChanges();
          }} />
        </View>

        <View css="settingButton invert">
          <Icon
            type="MaterialCommunityIcons"
            name="theme-light-dark"
            css="invertco"
          />
          <DropDownLocalList
            selectedValue={context.selectedThemeIndex}
            css="invert wi-90%"
            size={130}
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
              return false;
              //Updates.reloadAsync();
            }}
          />
        </View>
        <TouchableOpacity
          css="invert settingButton"
          onPress={() => state.showWebTester = true}>
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
