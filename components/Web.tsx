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
  invertColor,
  sleep
} from "../Methods";
import { ScrollView } from "react-native";
import { Asset, useAssets } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Player, DetailInfo } from "../../native";
import g from "../GlobalContext";
import View from "./ThemeView";
import Svg, {
  Circle,
  Rect,
  Text
} from "react-native-svg";

const Scroller = ({ ...props }: any) => {
  g.hook(
    "player.scrollProcent",
    "appSettings",
    "player.showPlayer"
  );
  const { size, strokeWidth, text, css } = props;
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  let svgProgress = 100 - g.player.scrollProcent;
  if (svgProgress < 0) svgProgress = 0;
  if (svgProgress > 100) svgProgress = 100;
  const textColor = invertColor(
    g.appSettings.backgroundColor
  );
  const textSize = 10;
  return (
    <View
      css={css}
      ifTrue={!g.player.showPlayer}>
      <Svg
        width={size}
        height={size}>
        {/* Background Circle */}
        <Circle
          stroke={
            props.bgColor
              ? props.bgColor
              : "#f2f2f2"
          }
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          {...{ strokeWidth }}
        />

        {/* Progress Circle */}
        <Circle
          stroke={
            props.pgColor
              ? props.pgColor
              : "#3b5998"
          }
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={
            radius *
            Math.PI *
            2 *
            (svgProgress / 100)
          }
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${
            size / 2
          })`}
          {...{ strokeWidth }}
        />

        {/* Text */}
        <Text
          fontSize={textSize}
          x={size / 2}
          y={size / 2 + (textSize / 2 - 1)}
          textAnchor="middle"
          fill={textColor}>
          {g.player.scrollProcent.toFixed(0)}
        </Text>
      </Svg>
    </View>
  );
};

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

  const postMessage = async (
    type: string,
    data: any,
    method?: string
  ) => {
    while (webView.current === undefined)
      await sleep(100);
    let item = { type, data };
    webView.current.injectJavaScript(`
        ${
          !method ? "window.loadData" : method
        }(${JSON.stringify(item)});
        true;
     `);
  };

  const loadFonts = async () => {
    try {
      let asset = Asset.fromModule(
        require("../assets/gfont.ttf")
      );
      await asset.downloadAsync();
      let fontUri = asset.localUri;
      asset = Asset.fromModule(Fonts[fontName]);
      await asset.downloadAsync();

      let css = `
      @font-face {
      font-family: 'Material Symbols Outlined';
      font-style: normal;
      font-weight: 400;
      src: url("${fontUri}") format('woff2');
      }
      
      @font-face {
      font-family: '${fontName}';
      src: url("${asset.localUri}") format('truetype')
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
  let getJs = (type, data) => {
    let item = { type, data };
    if (type == "content")
      item.data = { menuItems: data };
    return `window.loadData(${JSON.stringify(
      item
    )});`;
  };
  let injectData = async () => {
    try {
      while (!webView.current) await sleep(100);

      let font = await loadFonts();
      let js = `
      ${getJs("font", font)}
      true;
      `;
      webView.current.injectJavaScript(js);
    } catch (e) {
      console.error(e);
    }
  };

  const onMessage = ({ nativeEvent }) => {
    let data = JSON.parse(nativeEvent.data);
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
      case "Image":
        postMessage(
          "images",
          g.player.getImage(...data.data),
          "window.loadImages"
        );
        break;
    }
  };
  loading.current = true;
  return (
    <>
      <Scroller
        css="absolute ri:10 bo:10 zi:99"
        size={30}
        strokeWidth={4}
      />
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
        ${content?.content.replace(
          /\<\/( )?br>|\<br( )?(\/)?>/gim,
          ""
        )}
        <script>
          window.loadImages=(imgs)=>{
            imgs= imgs.data;
            let images = [...document.querySelectorAll("img")];
            for(let img of images){
              let src = img.getAttribute("src");
              let m = imgs.find(x=> x.h==src)
              if (m)
               img.setAttribute("src", m.cn);
            }
          }
          let images = document.querySelectorAll("img");
          let hrefs = [...images].map(x=> x.getAttribute("src"))
          if(${
            scrollDisabled ? "1==0" : "1 == 1"
          }){
           window.scroll(0, ${content.scroll});
          }
          function sleep(ms){
            return new Promise((r)=> setTimeout(r,ms))
          }
          async function psg(){
          while(window.postmsg === undefined || !document.getElementById("novel") || !window.ctx)
             await sleep(200);
            window.binder();
            ${getJs("style", css)}
            while(window.ctm == undefined){
              ${getJs("content", menuItems)}
              await sleep(100)
            }
            window.postmsg("data",true);
            if(hrefs.length >0)
              window.postmsg("Image",hrefs);
          }
          psg();
        </script>
        </body>
        </html>
        `,
          basUrl: ""
        }}
        onScroll={syntheticEvent => {
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
          g.player.scrollProcent =
            (100 * offset) /
            (contentHeight -
              g.player.paddingTop());

          if (scrollDisabled) return;
          if (loading.current) {
            timer(
              () => (loading.current = false)
            );
            return;
          }
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
          {
            ...g.size.screen,
            zIndex: 70,
            flex: 0
          },
          style
        ]}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
        onMessage={onMessage}
        injectedJavaScriptBeforeContentLoaded={
          script
        }
      />
    </>
  );
};