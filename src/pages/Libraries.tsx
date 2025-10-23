import {
  Image,
  ItemList,
  useLoader,
} from "../components";
import { View, Text, Icon, AlertDialog, Button, ScrollView } from "react-native-short-style";
import * as React from "react";
import Header from "./Header";
import { useView } from "../hooks";
import { Linking, RefreshControl } from "react-native";
import JSZip from "jszip";
import { Parser } from "../native/ParserItems";


type BtnTextType = "Install" | "Update" | "Uninstall";
const ListItem = ({ item, zip }: any) => {
  const state = buildState(() =>
  ({
    btnText: "Install" as BtnTextType,
    parser: undefined as Parser | undefined,
    parserCode: "",
  })).ignore("parser").build();
  const loader = useLoader(true)

  const load = async () => {
    try {
      loader.show();
      state.parserCode = await zip.file(item)?.async("text");
      if (state.parserCode) {
        let classfn = context.parser.parseCode(state.parserCode);
        if (classfn)
          state.parser = new classfn();
      }
    } catch (e) {
      console.error(e)
    }
    loader.hide();
  }

  const validate = () => {
    if (!state.parser)
      return
    let appSettings = context.appSettings;
    let btnText: BtnTextType = "Install";
    if (!appSettings.parsers)
      appSettings.parsers = [];
    let existingParser = appSettings.parsers.find(x => x.name == state.parser?.name);
    if (existingParser && existingParser.content == state.parserCode)
      btnText = "Uninstall";
    else if (existingParser || state.parser.name == context.parser.default)
      btnText = "Update";
    if (state.btnText != btnText)
      state.btnText = btnText;
  }

  state.useEffect(() => {
    validate();
  }, "parser")

  const install = async () => {
    if (loader.loading || state.parser == undefined)
      return;
    loader.show();
    let appSettings = context.appSettings;
    if (!appSettings.parsers)
      appSettings.parsers = [];
    if (state.parser.minVersion != undefined && state.parser.minVersion > context.version) {
      AlertDialog.alert({ message: `The new parser require app version to at least be ${state.parser.minVersion}, and the current app version is ${context.version} \n please update your app to the newset version`, title: "App Version error" });
    } else {
      context.parser.parserCodes.clear();
      appSettings.parsers = appSettings.parsers.filter(x => x.name != state.parser?.name);
      appSettings.parsers.push({ name: state.parser.name, content: state.parserCode });
      await appSettings.saveChanges();
      await context.cache.deleteDir(state.parser.name);
      await context.cache.checkDir();
      if (context.parser.current.name == state.parser.name)
        context.parser.set(context.parser.find(state.parser.name));
    }
    loader.hide();
  }

  const unistall = async () => {
    if (loader.loading)
      return;
    loader.show();
    let appSettings = context.appSettings;
    if (!appSettings.parsers)
      appSettings.parsers = [];
    context.parser.parserCodes.clear();
    appSettings.parsers = appSettings.parsers.filter(x => x.name != state.parser?.name);
    await appSettings.saveChanges();
    loader.hide();
  }

  context.useEffect(() => {
    validate();
  }, "appSettings")

  useEffect(() => {
    load();
  }, [])

  let btnIcon = (<Icon name="install" type="Entypo" css={"co-#fff"} size={15} />)
  if (state.btnText == "Uninstall")
    btnIcon = (<Icon name="uninstall" type="Entypo" css={"co-red"} size={15} />)

  if (state.btnText == "Update")
    btnIcon = (<Icon name="update" type="MaterialIcons" css={"co-#fff"} size={15} />)


  if (!state.parser)
    return null;
  return (
    <>
      {loader.elem}
      <View css="flex he-45 invert wi-100% fld-row ali-center pal-5">
        <Image url={`http://www.google.com/s2/favicons?domain=${state.parser.url}`} css="resizeMode:contain he:20 wi:20" />
        <Text css="pal-5 header">{state.parser.name}
          <Text css="co-primary"> ({state.parser.type})</Text>
          <Text ifTrue={state.parser.minVersion != undefined && context.version < state.parser.minVersion} css="co-red fos-10 fow-bold">{"\n"}MinAppVersion:{state.parser.minVersion}</Text>
        </Text>
        <View css="fld-row _abc ri-0 juc-space-between ali-center he-100% wi-170">
          <Button css="he-100% juc-center bor-0 mab-0 miw-50" onPress={() => Linking.openURL(state.parser?.url ?? "")} icon={<Icon name="browser" type="Entypo" css={"co-#fff mal-0 pa-0"} size={15} />} />
          <Button textCss="co-#fff fow-bold" css="miw-120 he-100% bor-0 mab-0 pal-10" icon={btnIcon} onPress={state.btnText != "Uninstall" ? install : unistall} text={state.btnText} />
        </View>
      </View>
    </>
  )
}

const Libraries = ({ ...props }) => {
  const libUrl = "https://raw.githubusercontent.com/1-AlenToma/Novelo/refs/heads/main/parsers.zip";
  const [render, state, loader] = useView({
    component: ItemList,
    loader: {
      text: "loading",
      value: true
    },
    state: {
      parserNames: [] as string[],
      refItem: {
        zip: undefined as JSZip | undefined
      }
    }
  });

  useEffect(() => {
    loadeParser();
  }, [])

  const loadeParser = async () => {
    try {
      loader.show()
      let response = await fetch(libUrl);
      if (!(response.status === 200 || response.status === 0))
        throw "Parsers could not be reached";
      const blob = await response.arrayBuffer();
      state.refItem.zip = await JSZip.loadAsync(blob);
      state.parserNames = Object.keys(state.refItem.zip.files ?? {}).filter(x => x.endsWith(".js")).reverse();
    } catch (e) {
      if (!__DEV__)
        AlertDialog.toast({ type: "Info", title: "Network Error", message: "Extensions could no be loaded,Something went wrong when fetching the data, please check your internet connection." });
      console.error(e);
    }

    loader.hide();
  }

  return (
    <>
      <Header
        {...props}
        title="Extensions"
      />
      <ScrollView css={"invert"} refreshControl={<RefreshControl refreshing={loader.loading} onRefresh={() => loadeParser()} />}>

        <View css="flex pa-5 invert ali-center">

          <View css="itemListContainer">
            <Text css="desc fos-12 co-red fow-bold tea-left wi-100% pal-5">Browse between installed parsers in Home tab </Text>
            {render(undefined, {
              items: state.parserNames,
              container: ({ item }: any) => <ListItem zip={state.refItem.zip} item={item} />,
              itemCss: "clearwidth ali:center juc:center mab:5 overflow bor:5",
              vMode: true
            })}
          </View>
        </View>
      </ScrollView>
    </>
  )


}


export default Libraries;