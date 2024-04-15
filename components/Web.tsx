import WebView from "react-native-webview";
import script from "../assets/readerjs";
import Fonts from "../assets/Fonts";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { useTimer, useView } from "../hooks";
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
import View from "./ThemeView";
import TextView from "./ThemeText";
import BattariView from "./BattariView";
import ProgressBar from "./ProgressBar";
import Svg, {
  Circle,
  Rect,
  Text
} from "react-native-svg";

const jsScript = `
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", (event) => {
  try{
${script}
}catch(e){
  
}
});
}else {
  try{
${script}
}catch(e){
  
}
}
true;
`;

const Clock = ({ secondEnabled }: any) => {
  const Timer = useTimer(1000);
  const [time, setTime] = useState("");
  function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    if (secondEnabled)
      setTime(h + ":" + m + ":" + s);
    else setTime(h + ":" + m);
    Timer(() => startTime());
  }

  function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  }

  useEffect(() => {
    startTime();
  }, []);

  return (
    <View>
      <TextView
        style={{
          color: invertColor(
            context.appSettings.backgroundColor
          )
        }}
        css="bold fos:10">
        {time}
      </TextView>
    </View>
  );
};

const Scroller = ({ ...props }: any) => {
  context.hook(
    "player.scrollProcent",
    "appSettings",
    "player.showPlayer"
  );

  let svgProgress = context.player.scrollProcent;
  if (svgProgress < 0) svgProgress = 0;
  if (svgProgress > 100) svgProgress = 100;

  return (
    <ProgressBar
      ifTrue={() =>
        context.player.showPlayer != true
      }
      speed={200}
      color="#3b5998"
      procent={svgProgress}
      text={false}
    />
  );
};

export default ({
  click,
  onScroll,
  onMenu,
  onComments,
  menuItems,
  style,
  bottomReched,
  topReched
}: any) => {
  context.hook("appSettings.backgroundColor");

  const [render, state, _, timer] = useView({
    timer: 200,
    component: WebView,
    ref: r => {
      if (r) {
        state.refItem.webView = r;
      }
    },
    nestedScrollEnabled: true,
    cacheEnabled: false,
    allowFileAccess: true,
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: true,
    javaScriptEnabled: true,
    injectedJavaScriptBeforeContentLoaded:
      jsScript,
    onScroll: syntheticEvent => {
      const {
        contentOffset,
        layoutMeasurement,
        contentSize
      } = syntheticEvent.nativeEvent;

      const offset = Math.round(
        contentOffset.y + layoutMeasurement.height
      );
      const contentHeight = Math.round(
        contentSize.height
      );
      context.player.scrollProcent =
        (100 * offset) /
        (contentHeight -
          context.player.paddingTop());
      if (context.player.showPlayer) return;
      if (state.refItem.loading) {
        timer(
          () => (state.refItem.loading = false)
        );
        return;
      }

      timer(() => {
        if (offset == contentHeight) {
          if (
            context.appSettings.navigationType ==
            "Scroll"
          )
            bottomReched?.();
        } else if (contentOffset.y <= 10) {
          if (
            context.appSettings.navigationType ==
            "Scroll"
          )
            topReched?.();
        } else onScroll?.(contentOffset.y);
      });
    },
    contentMode: "mobile",
    scalesPageToFit: true,
    originWhitelist: ["*"],
    scrollEnabled: true,
    refItem: {
      loading: false,
      webView: undefined,
      assets: {}
    }
  });

  let getJs = (type, data) => {
    let item = { type, data };
    if (type == "content")
      item.data = { menuItems: data };
    return `
    try{
    window.loadData(${JSON.stringify(item)});
    }catch(e){
    }
    `;
  };

  const postMessage = async (
    type: string,
    data: any,
    method?: string
  ) => {
    while (state.refItem.webView === undefined)
      await sleep(100);
    let item = { type, data };
    state.refItem.webView.injectJavaScript(`
        ${
          !method ? "window.loadData" : method
        }(${JSON.stringify(item)});
        true;
     `);
  };

  const loadFonts = async () => {
    try {
      if (
        !state.refItem.assets[
          context.appSettings.fontName
        ]
      ) {
        state.refItem.assets = {};
        let asset = Asset.fromModule(
          require("../assets/gfont.ttf")
        );
        await asset.downloadAsync();
        let fontUri = asset.localUri;
        asset = Asset.fromModule(
          Fonts[context.appSettings.fontName]
        );
        await asset.downloadAsync();
        state.refItem.assets[
          context.appSettings.fontName
        ] = {
          icons: fontUri,
          font: asset.localUri
        };
      }
      let css = `
      @font-face {
      font-family: 'Material Symbols Outlined';
      font-style: normal;
      font-weight: 400;
      src: url("${
        state.refItem.assets[
          context.appSettings.fontName
        ].icons
      }") format('woff2');
      }
      
      @font-face {
      font-family: '${
        context.appSettings.fontName
      }';
      src: url("${
        state.refItem.assets[
          context.appSettings.fontName
        ].font
      }") format('truetype')
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
      await postMessage("font", css);
    } catch (e) {
      return "";
      console.error(e);
    }
  };

  const loadCss = async () => {
    let color =
      context.appSettings.backgroundColor;
    let inverted = invertColor(color);
    let shadow = inverted.has("white")
      ? "#4e4d4d"
      : "#919191";
    let shadowLength = (1).sureValue(
      context.appSettings.shadowLength,
      true
    );

    let cssStyle = `
        .highlight {
          border-radius: 5px;
          display: inline;
          color: ${
            context.appSettings
              .voiceWordSelectionsSettings?.color
              ? invertColor(
                  context.appSettings
                    .voiceWordSelectionsSettings
                    ?.color
                )
              : color
          } !important;
          background-color: ${
            context.appSettings
              .voiceWordSelectionsSettings
              ?.color ?? inverted
          } !important;
        }
        *:not(context):not(context *) {
          font-family: "${
            context.appSettings.fontName
          }";
          font-size-adjust: 1;
          font-style: ${
            context.appSettings.fontStyle ??
            "normal"
          };
          ${
            context.appSettings.use3D
              ? `
            text-shadow: 1px ${shadowLength}px 1px ${shadow};
            `
              : ""
          }
        }
        parameter {
          display: none;
        }
        blur p {
          color: ${color};
          background-color: ${inverted};
          padding: 5px;
          border-radius: 10px;
          overflow: hidden;
        }
        *:not(context):not(context *):not(
            .custom
          ):not(blur):not(blur *):not(
            .highlight
          ) {
          background-color: transparent;
          color: ${inverted} !important;
        }
        body {
          background-color: ${color} !important;
        }
        .comments {
          text-decoration: underline;
          display: inline-block;
          position: relative;
        }
        context > div > a {
          width: 100%;
        }
        body img {
          max-width: 98%;
        }
        
        body .novel {
          max-width: 100%;
          min-height: ${
            !context.player.showPlayer
              ? "100%"
              : "50%"
          };
          
          top: ${
            context.player.showPlayer
              ? "45px"
              : "0px"
          };
          position: relative;
          overflow: hidden;
          text-align-vertical: top;
          padding-bottom: ${context.player.paddingBottom()}px;
          padding-top: ${context.player.paddingTop()}px;
          padding-left: ${(5).sureValue(
            context.appSettings.margin
          )}px;
          padding-right: ${(5).sureValue(
            context.appSettings.margin
          )}px;
          font-size: ${
            context.appSettings.fontSize
          }px;
          line-height: ${
            context.appSettings.fontSize * 1.7
          }px;
          text-align: ${
            context.appSettings.textAlign
          };
        }
        
      `;
    if (context.player.showPlayer) {
      cssStyle += `
      .novel >p {
        display:block;
        position:relative;
        overflow:hidden;
        overflow-y:auto;
        min-height:100%;
        max-height:100%;
        width:100%;
        margin-top:40px;
      }
      
      body .novel {
        min-height:auto !important;
        max-height:auto !important;
        height:85vh;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      `;
    }
    await postMessage("style", cssStyle);
    await loadFonts();
  };

  const loadHtmlContent = async () => {
    if (context.player.isloading) return;
    state.refItem.loading = true;
    let content = {
      inlineStyle:
        context.player.book.inlineStyle,
      content: context.player.showPlayer
        ? `<p>${
            context.player
              .currentPlaying()
              ?.cleanText() ?? ""
          }</p>`
        : context.player.html,
      scroll:
        context.player.currentChapterSettings
          .scrollProgress
    };

    state.refItem.webView.injectJavaScript(`
     // clear body
     try{
       if(window.postmsg){
     document.body.innerHTML = "";
    const loadBody = (content)=>{
    let div = document.createElement("div");
    div.id= "novel";
    div.className = "novel";
    div.innerHTML = content.content;
    document.body.appendChild(div);
    let st = document.getElementById(
          "inlineStyle"
        );
        if (st) st.remove();
        st = document.createElement("style");
        st.id = "inlineStyle";
        st.appendChild(
          document.createTextNode(content.inlineStyle)
        );
        document.head.appendChild(st);
    window.cleanStyle("novel");
    let images = document.querySelectorAll("img");
    [...images].forEach((x,i)=> {
      if(!window.isValidUrl(x.src)){
      x.id = "img"+i;
      window.renderImage(x.id)
      }
      });
    
    if("${
      context.appSettings.navigationType || "Snap"
    }" === "Snap"){
            window.bookSlider= new window.slider({
             id: "novel",
             hasNext: ${context.player
               .hasNext()
               .toString()
               .toLowerCase()},
             hasPrev: ${context.player
               .hasPrev()
               .toString()
               .toLowerCase()},
             prevText: "Previous Chapter",
             nextText: "Next Chapter"
             });
            }
    
             
    if(${context.player.showPlayer
      .toString()
      .toLowerCase()}){
      let parag = document.querySelector(".novel po")
      if(parag)
         {
           parag.scrollIntoView({
            block: "start",
            inline: "center"
           });
         }
    }else {
      window.scroll(0, ${content.scroll});
    }
    }
    
    loadBody(${JSON.stringify(content)});
    ${getJs("content", menuItems)}
    window.binder();
   // window.postmsg("enable",false);
       }
     }catch(e) {}
    true;
    `);
    state.refItem.loading = true;
  };

  context.subscribe(
    () => {
      loadCss();
    },
    "appSettings",
    "player.showPlayer"
  );

  context.subscribe(
    () => {
      loadHtmlContent();
    },
    "appSettings",
    "player.html",
    "player.book.inlineStyle",
    "player.showPlayer",
    "player.currentChapterSettings.audioProgress",
    "player.isloading"
  );

  const onMessage = async ({ nativeEvent }) => {
    let data = JSON.parse(nativeEvent.data);
    switch (data.type) {
      case "scrollValue":
        onScroll?.(data.data);
        break;
      case "bottomReched":
      case "Next":
        bottomReched?.();
        break;
      case "topReched":
      case "Prev":
        topReched?.();
        break;
      case "click":
        click?.(data.data);
        break;
      case "data":
        loadCss();
        loadHtmlContent();
        break;
      case "menu":
        onMenu?.(data.data);
        break;
      case "warn":
        console.warn(data);
        break;
      case "log":
        console.log(data);
        break;
      case "error":
        console.error(data);
        break;
      case "Comments":
        onComments?.(data.data);
        break;
      case "enable":
        state.refItem.loading = false;
        break;
      case "Image":
        postMessage(
          "images",
          {
            id: data.data.id,
            src: await context.player.getImage(
              data.data.src
            )
          },
          "window.renderImage"
        );
        break;
    }
  };
  state.refItem.loading = true;

  context.subscribe(
    () => {
      if (
        !context.player.showPlayer ||
        !context.player.highlightedText ||
        !context.player.highlightedText.text
      )
        return;
      let json = JSON.stringify({
        block:"nearest",
        inline:"start",
        all: !(
          context.appSettings
            .voiceWordSelectionsSettings
            ?.appendSelection ?? false
        ),
        scroll: true,
        selector: "#novel >p",
        text: context.player.highlightedText.text,
        index:
          context.player.highlightedText.index,
        length:
          context.player.highlightedText.length
      });
      state.refItem.webView?.injectJavaScript(`
    try{
    window.highlight(${json});
    }catch(e){
    }
      true;
    `);
    },
    "player.highlightedText",
    "appSettings"
  );

  return (
    <>
      <View css="absolute he:5 wi:100% le:1 bo:0 zi:99 juc:space-between ali:center">
        <Scroller />
      </View>
      <View css="row absolute bo:1 ri:10 zi:99 juc:center ali:center">
        <Clock />
        <BattariView
          color={
            context.appSettings.backgroundColor
          }
        />
      </View>
      {render(null, {
        source: {
          html: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width,  initial-scale=1" />
        <style>
        
          br{
            display:none;
          }
        </style>
        <script>
        try{
          window.isValidUrl = urlString=> {
            return urlString.indexOf("https") != -1 || urlString.indexOf("http") != -1 ||urlString.indexOf("www.") != -1
          }
          window.renderImage= (item)=>{
            try{
            let img = undefined;
            if(!item)
              return;
            if(typeof item === "string"){
              img =document.getElementById(item);
               window.postmsg("Image",{src:img.src, id:item});
            }
             else {
               img = document.getElementById(item.data.id);
               if(!img || item.data.src.length<=0){
                 if(img)
                  img.remove();
                  return;
               }
                  
              img.setAttribute("src", item.data.src[0].cn);
             }
            }catch(e){}
          }
          
          function sleep(ms){
            return new Promise((r)=> setTimeout(r,ms))
          }
          async function psg(){
          while(window.postmsg === undefined || !window.ctx)
             await sleep(200);
            window.postmsg("data",true);
          }
          psg();
        }catch(e){
          
        }
        </script>
        </head>
        <body>
        
        </body>
        </html>
        `,
          basUrl: ""
        },
        style: {
          backgroundColor:
            context.appSettings.backgroundColor
        },
        containerStyle: [
          {
            backgroundColor:
              context.appSettings.backgroundColor,
            zIndex: 70,
            flex: 0,
            flexGrow: 1
          },
          style
        ],
        onMessage: onMessage
      })}
    </>
  );
};
