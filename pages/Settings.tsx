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

import { useState } from "../native";

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
        css="mih:200 ali:center bor:5 overflow">
        <Image
          url={require("../assets/icon.png")}
          css="resizeMode:contain mat:2.5 clearwidth wi:50 he:50 bor:2"
        />
        <TouchableOpacity
          css="listButton pa:5 clearwidth"
          onPress={() =>
            (state.downloadShow = true)
          }>
          <Icon
            invertColor={true}
            type="FontAwesome"
            name="download"
          />
          <Text invertColor={true}>
            Download Backup
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
