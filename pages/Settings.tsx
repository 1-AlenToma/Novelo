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
  useLoader
} from "../components/";
import g from "../GlobalContext";
import { Book, Chapter } from "..db";
import { Platform } from "react-native";
import { useState } from "../native";
import { getDirectoryPermissions } from "../Methods";
import * as DocumentPicker from "expo-document-picker";

export default (props: any) => {
  let loader = useLoader();
  const [books, dataIsLoading] = g.db().useQuery(
    "Books",
    g
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
    await g.dbContext().downloadDatabase({
      ...state
    });
    loader.hide();
    g.alert("File Downloded").show();
  };

  const cleanData = () => {
    g.alert(
      "Are you sure?",
      "Please Confirm"
    ).confirm(async () => {
      try {
        loader.show();

        let _books = g
          .db()
          .querySelector<Book>("Books")
          .Where.Column(x => x.favorit)
          .EqualTo(false)
          .AND.Column(x => x.parserName)
          .NotEqualTo("epub");
        let ids = (await _books.toList()).map(
          x => x.id
        );
        if (ids.length > 0)
          await g
            .db()
            .querySelector<Chapter>("Chapters")
            .Where.Column(x => x.parent_Id)
            .IN(ids)
            .delete();
        await _books.delete();
        let cacheFiles = await g.cache.allFiles();
        for (let f of cacheFiles) {
          await g.cache.delete(f);
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
    let msg = await g
      .dbContext()
      .uploadData(uri, p => {
        state.procent = p;
      });
    loader.hide();
    if (msg) g.alert(msg);
  };

  return (
    <View css="flex">
      {loader.elem}
      <Modal
        height="60"
        onHide={() =>
          (state.downloadShow =
            !state.downloadShow)
        }
        visible={state.downloadShow}
        title="Backup options">
        <View css="flex pat:10">
          <View css="form formlist">
            <Text invertColor={true}>
              Include FontSettings
            </Text>
            <CheckBox
              invertColor={true}
              checked={state.appSettings}
              onChange={() =>
                (state.appSettings =
                  !state.appSettings)
              }
            />
          </View>
          <View css="form formlist">
            <Text invertColor={true}>
              Include Epubs
            </Text>
            <CheckBox
              invertColor={true}
              checked={state.epubs}
              onChange={() =>
                (state.epubs = !state.epubs)
              }
            />
          </View>

          <View css="mih:10 flex mat:20">
            <View css="form formlist">
              <Text invertColor={true}>
                Include All novels
              </Text>
              <CheckBox
                invertColor={true}
                checked={state.all}
                onChange={() =>
                  (state.all = !state.all)
                }
              />
            </View>
            <ItemList
              updater={[state.items, state.all]}
              onPress={item => {
                state.all = false;
                if (
                  state.items.find(
                    x =>
                      x.url === item.url &&
                      x.parserName ==
                        item.parserName
                  )
                ) {
                  state.items = [
                    ...state.items.filter(
                      x =>
                        x.url !== item.url &&
                        x.parserName !=
                          item.parserName
                    )
                  ];
                } else
                  state.items = [
                    ...state.items,
                    item
                  ];
              }}
              items={books}
              container={({ item }) => (
                <View css="form flex formlist">
                  <Text invertColor={true}>
                    {item.name}
                  </Text>
                  <CheckBox
                    invertColor={true}
                    checked={
                      state.all ||
                      state.items.find(
                        x =>
                          x.url === item.url &&
                          x.parserName ==
                            item.parserName
                      )
                    }
                  />
                </View>
              )}
              itemCss="listButton"
              vMode={true}
            />
            <View css="clearwidth ali:center">
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
          </View>
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
            url={require("../assets/icon.png")}
            css="resizeMode:contain mat:2.5 clearwidth wi:50 he:50 bor:2"
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
      </View>
    </View>
  );
};
