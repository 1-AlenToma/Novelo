import WebView from "react-native-webview";
import script from "../assets/readerjs";
import Fonts from "../assets/Fonts";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { useTimer } from "../hooks";
import {
  arrayBuffer,
  newId
} from "../../Methods";
import { Asset, useAssets } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { sleep } from "../Methods";
import { Player, DetailInfo } from "../../native";
import g from "../GlobalContext";

export default ({
  click,
  onScroll,
  onMenu,
  menuItems,
  content,
  css,
  style,
  fontName,
  bottomReched,
  topReched
}: any) => {
  g.hook("size");
  const jsCode = useRef();
  const loading = useRef(true);
  const timer = useTimer(100);
  const webView = useRef();
  const [assets] = useAssets(
    require("../assets/gfont.ttf")
  );

  const postMessage = (
    type: string,
    data: any
  ) => {
    if (webView.current === undefined) return;
    let item = { type, data };
    if (type == "content")
      item = { type, ...data };
    //console.error(type, data);
    webView.current.postMessage(
      JSON.stringify(item)
    );
  };

  const loadFonts = async () => {
    try {
      let iconsFont =
        await FileSystem.readAsStringAsync(
          assets.firstOrDefault("localUri"),
          {
            encoding: "base64"
          }
        );
      let asset = Asset.fromModule(
        Fonts[fontName]
      );
      await asset.downloadAsync();

      let font =
        await FileSystem.readAsStringAsync(
          asset.localUri,
          {
            encoding: "base64"
          }
        );
      let css = `
      @font-face {
      font-family: 'Material Symbols Outlined';
      font-style: normal;
      font-weight: 400;
      src: url(data:font/truetype;charset=utf-8;base64,${iconsFont}) format('woff2');
      }
      
      @font-face {
      font-family: '${fontName}';
      src: url(data:font/truetype;charset=utf-8;base64,${font}) format('truetype')
      }

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}`;
      postMessage("font", css);
    } catch (e) {
      console.error(e);
    }
  };

  let injectData = () => {
    try {
      let data = JSON.stringify({
        type: "content",
        ...content,
        menuItems
      });
      let cssData = JSON.stringify({
        type: "style",
        data: css
      });
      let js = `
      loadData(${cssData})
      loadData(${data});
      true;`;
      jsCode.current = js;
      loading.current = true;
      postMessage("content", {
        ...content,
        menuItems
      });
      postMessage("style", css);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    injectData();
  }, [content, css, fontName, g.size]);

  useEffect(() => {
    if (assets?.firstOrDefault("localUri"))
      loadFonts();
  }, [assets, fontName]);

  const onMessage = ({ nativeEvent }) => {
    let data = JSON.parse(nativeEvent.data);
    console.log(data);
    switch (data.type) {
      case "scroll":
        onScroll?.(data.data);
        break;
      case "bottomReched":
        bottomReched?.();
        break;
      case "topReched":
        topReched?.();
        break;
      case "click":
        click?.(data.data);
        break;
      case "data":
        injectData();
        break;
      case "menu":
        onMenu?.(data.data);
        break;
      case "log":
        console.log(data);
        break;
      case "error":
        console.error(data);
        break;
    }
  };

  return (
    <WebView
      ref={r => {
        if (r) {
          webView.current = r;
          injectData();
        }
      }}
      source={{
        basUrl: ""
      }}
      injectedJavaScript={jsCode.current}
      domStorageEnabled={true}
      originWhitelist={["*"]}
      style={[
        { ...g.size.screen, zIndex: 99, flex: 1 },
        style
      ]}
      javaScriptEnabled={true}
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={`
      ${script}
      binder({});
      true;
      `}
    />
  );
};
