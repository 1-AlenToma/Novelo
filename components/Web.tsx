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
  newId,
  sleep
} from "../Methods";
import { ScrollView } from "react-native";
import { Asset, useAssets } from "expo-asset";
import * as FileSystem from "expo-file-system";
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
  topReched,
  scrollDisabled
}: any) => {
  g.hook("size");
  const loading = useRef(true);
  const timer = useTimer(200);
  const webView = useRef();

  const postMessage = (
    type: string,
    data: any
  ) => {
    if (webView.current === undefined) return;
    let item = { type, data };
    if(type== "content")
      item.data = {...data}
    webView.current.injectJavaScript(`
    window.loadData(${JSON.stringify(item)});
    true;
    `);
    return;
    webView.current.postMessage(
      JSON.stringify(item)
    );
  };

  const loadFonts = async () => {
    try {
      let asset = Asset.fromModule(
        require("../assets/gfont.ttf")
      );
      await asset.downloadAsync();
      let iconsFont =
        await FileSystem.readAsStringAsync(
          asset.localUri,
          {
            encoding: "base64"
          }
        );
      asset = Asset.fromModule(
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
      return css;
      postMessage("font", css);
    } catch (e) {
      return "";
      console.error(e);
    }
  };

  let injectData = async () => {
    try {
      while(!webView.current)
        await sleep(100)
    let getJs=(type, data)=>{
      let item = {type,data}
      if(type == "content")
      item.data = {menuItems:data};
      return `window.loadData(${JSON.stringify(item)});`
    } 
    let font =await loadFonts();
      let js =`
      ${getJs("style", css)}
      ${getJs("font", font)}
       ${getJs("content", menuItems)}
      true;
      `;
      webView.current.injectJavaScript(js);
      //postMessage("content", {menuItems});
     // await sleep(100)
     // postMessage("style", css);
      //await sleep(100)
     //await loadFonts();
    } catch (e) {
      console.error(e);
    }
  };

  const onMessage = ({ nativeEvent }) => {
    let data = JSON.parse(nativeEvent.data);
    //console.log(data);
    switch (data.type) {
      case "scrollValue":
        alert(data.data);
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
  loading.current = true;
  return (
    <WebView
      ref={r => {
        if (r) {
          webView.current = r;
          //r.clearCache(true);
          //injectData();
        }
      }}
      nestedScrollEnabled={true}
      scrollEnabled={false}
      source={{
        html: `
        <html>
        <head>
        <meta name="viewport" content="width=device-width,  initial-scale=1" />
        </head>
        <body>
        ${content?.content.replace(/\<\/( )?br>|\<br( )?(\/)?>/gim, '')}
        <script>
          if(${scrollDisabled ? "1==0" : "1 == 1"})
              window.scroll(0, ${content.scroll});
          function sleep(ms){
            return new Promise((r)=> setTimeout(r,ms))
          }
          async function psg(){
          while(window.postmsg === undefined || !document.getElementById("novel"))
             await sleep(100);
            window.postmsg("data",true);
          }
          psg();
        </script>
        </body>
        </html>
        `,
        basUrl: ""
      }}
      onScroll={syntheticEvent => {
        if (scrollDisabled) return;
        if (loading.current) {
          timer(() => (loading.current = false));
          return;
        }
        const {
          contentOffset,
          layoutMeasurement,
          contentSize
        } = syntheticEvent.nativeEvent;

        const offset = Math.round(
          contentOffset.y +
            layoutMeasurement.height
        );
        const contentHeight = Math.round(
          contentSize.height
        );
        //console.warn("scroll", offset);
        timer(() => {
          if (offset == contentHeight) {
            bottomReched?.();
          } else if (contentOffset.y <= 10) {
            topReched?.();
          } else onScroll?.(contentOffset.y);
        });
      }}
      contentMode="mobile"
      scalesPageToFit={true}
      originWhitelist={["*"]}
      scrollEnabled={true}
      containerStyle={[
        { ...g.size.screen, zIndex: 99, flex: 0 },
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
