import WebView from "react-native-webview";
import Fonts from "../assets/Fonts";
import { CSSStyle, JS } from "../assets/readerJs";
import * as React from "react";
import useView from "../hooks/useView";
import useTimer from "../hooks/Timer"
import {
  invertColor,
  sleep
} from "../Methods";
import { Asset } from "expo-asset";
import { View, Text as TextView, ProgressBar } from "./ReactNativeComponents";
import BattariView from "./BattariView";
import WebOptions from "../native/WebOptions";

const jsScript = `
try{
window.__DEV__ = ${__DEV__.toString().toLowerCase()};
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", (event) => {
${JS}
});
}else {
${JS}
}
}catch(e){
if (window.__DEV__)
   alert(e)
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
    <View css="clb">
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
      value={svgProgress / 100}
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

  const [render, state, loader, timer] = useView({
    timer: 200,
    component: WebView,
    loader: {
      text: "Loading, Please wait",
      value: true
    },
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
    injectedJavaScriptBeforeContentLoaded: jsScript,
    contentMode: "mobile",
    scalesPageToFit: true,
    originWhitelist: ["*"],
    scrollEnabled: false,
    bounces: false,
    refItem: {
      loading: false,
      webView: undefined,
      assets: {},
      firstLoad: false
    }
  });

  context.hook("appSettings.backgroundColor");

  const postMessage = async (
    type: string,
    data: any,
    method?: string,
    id?: string
  ) => {
    while (state.refItem.webView === undefined) {
      console.warn("WebView not loaded")
      await sleep(100);
    }
    let item = { type, data, id };
    state.refItem.webView.injectJavaScript(`${!method ? "window.loadData" : method}(${JSON.stringify(item)}); true;`);
  };

  const loadFonts = async () => {

    try {
      if (!state.refItem.assets[context.appSettings.fontName]) {
        state.refItem.assets = {};
        let asset = Asset.fromModule(require("../assets/gfont.ttf"));
        await asset.downloadAsync();
        let fontUri = asset.localUri;
        asset = Asset.fromModule(Fonts[context.appSettings.fontName]);
        await asset.downloadAsync();
        state.refItem.assets[context.appSettings.fontName] = {
          icons: fontUri,
          font: asset.localUri
        };
      }
      let css = `
      @font-face {
      font-family: 'Material Symbols Outlined';
      font-style: normal;
      font-weight: 400;
      src: url("${state.refItem.assets[context.appSettings.fontName].icons}") format('woff2');
      }
      
      @font-face {
      font-family: '${context.appSettings.fontName}';
      src: url("${state.refItem.assets[context.appSettings.fontName].font}") format('truetype');
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

      await postMessage("CSS", css, undefined, "fontCSS"); // font

    } catch (e) {
      return "";
      console.error(e);
    }
  };

  const loadCss = async () => {
    let color = context.appSettings.backgroundColor;
    let inverted = invertColor(color);
    let shadow = inverted.has("white") ? "#4e4d4d" : "#919191";
    let shadowLength = (1).sureValue(context.appSettings.shadowLength, true);

    let cssStyle = `
         strong{
           font-weight:bold !important;
         }
         .italic, i {
           display:inline !important;
           font-style: italic !important;
           font-size: ${context.appSettings.fontSize - 4}px !important;
         }
         
        .highlight {
          border-radius: 0px;
          display: inline-block;
          color: ${context.appSettings.voiceWordSelectionsSettings?.color ? invertColor(context.appSettings.voiceWordSelectionsSettings?.color) : color} !important;
          background-color: ${context.appSettings.voiceWordSelectionsSettings?.color ?? inverted} !important;
        }
        
        *:not(.selection-menu):not(.selection-menu *):not(.italic):not(i):not(.ScollPreview) {
          font-style:${(context.appSettings.fontStyle ?? "normal").toLowerCase()} !important;
        }
        
        *:not(.selection-menu):not(.selection-menu *):not(.ScollPreview) {
          font-family: "${context.appSettings.fontName}" !important;
          font-size-adjust: 1;
          ${context.appSettings.use3D ? ` text-shadow: 1px ${shadowLength}px 1px ${shadow};` : ""}
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

        *:not(.selection-menu):not(.selection-menu *):not(.custom):not(blur):not(blur *):not(.highlight):not(.ScollPreview) {
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

        body img {
          max-width: 98%;
        }

        .Manga img {
          margin: auto;
          margin-bottom: 5px;
          display: block;
        }
        
        h1,h2,h3,h4,h5,h6{
          line-height: ${(context.appSettings.lineHeight ?? (context.appSettings.fontSize * context.lineHeight)) + 5}px !important;
          font-size: ${context.appSettings.fontSize + 5}px;
        }

        br{
          display:none;
        }

       .novel p{
           display:block !important;
           position:relative !important;
           clear:both !important;
           width:100%;
        }

        .novel p, .novel h1, .novel h2, .novel h3, .novel h3, .novel h4, .novel h5{
           margin-bottom: ${context.appSettings.sentenceMargin ?? 5}px !important;
        }
      
        * {
          outline: none !important;
         }
      `;
    if (context.player.showPlayer) {
      cssStyle += `
      .sliderView p {
        display:block;
        position:relative;
        margin-top:40px;
      }
      `;
    }
    await postMessage("CSS", cssStyle, undefined, "dynamicCSS");
    await loadFonts();
    await postMessage("CSS", cleanInlineStyle(), undefined, "inlineStyle");
  };

  const cleanInlineStyle = () => {
    let inlineStyle = context.player.book.inlineStyle;
    return inlineStyle.replace(/(background-color|font-family|color|font-size|line-height|text-align|font-weight)\:.*\;/gmi, "");
  }

  const loadHtmlContent = async () => {
    try {
      if (context.player.isloading) return;
      loader.show();
      let content = {
        inlineStyle: cleanInlineStyle(),
        content: context.player.showPlayer ? `<p>${context.player.currentPlaying()?.cleanText() ?? ""}</p>` : context.player.html,
        scroll: context.player.currentChapterSettings.scrollProgress
      };

      // console.warn(content)
      const options = new WebOptions();
      options.style = {
        textAlignVertical: "top",
        textAlign: context.appSettings.textAlign,
        alignItems: (context.player.showPlayer ? "center" : "unset")
      };
      options.viewStyle = {
        paddingLeft: (5).sureValue(context.appSettings.margin),
        paddingRight: (5).sureValue(context.appSettings.margin),
        paddingTop: "40px",
        lineHeight: context.appSettings.lineHeight ?? (context.appSettings.fontSize * context.lineHeight),
        fontSize: context.appSettings.fontSize,
        maxHeight: "100%",
        overflowY: "auto"
      };

      let scrollType = context.player.novel.type?.isManga() ? "PaginationScroll" : (context.player.showPlayer ? "Player" : (context.appSettings.navigationType == "Snap" ? "Pagination" : (context.appSettings.navigationType == "ScrollSnap" ? "PaginationScroll" : "Scroll")));
      options.content = content.content;
      options.scrollDisabled = false;
      options.scrollValue = content.scroll;
      options.scrollType = scrollType as any;
      options.addNext = context.player.hasNext();
      options.addPrev = context.player.hasPrev();
      options.prevText = "Previous Chapter";
      options.nextText = "Next Chapter";
      options.menu = options.func("click", menuItems, `(item)=> window.postmsg("menu", item)`);
      options.addFunction("onEnd", `()=> {window.postmsg("Next", true);}`);
      options.addFunction("onStart", `()=> {window.postmsg("Prev", true);}`);
      options.addFunction("onscroll", `(value)=> {window.postmsg("scrollValue", value);}`);
      options.addFunction("scrollPercentageValue", `(percent) => {window.postmsg("scrollpercent", percent);}`);
      let json = JSON.stringify(options);
      json = json.replace(`"HTMLCONTENT"`, "`" + JSON.stringify(content.content).slice(1, -1) + "`");

      const sliderJs = (`
      if(window.loadBody){
        window.loadBody(${json})
      }
      true;
    `);
      await postMessage("CSS", CSSStyle);// reader style
      state.refItem.webView?.injectJavaScript(sliderJs);
    } catch (e) {
      console.error(e)
    }
  };

  context.useEffect(
    () => {
      if (!state.refItem.firstLoad)
        return;
      loadCss();
    },
    "appSettings",
    "player.showPlayer",
  );

  context.useEffect(
    () => {
      if (!state.refItem.firstLoad)
        return;
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
      case "loader":
        if (data.data) loader.show();
        else loader.hide();
        break;
      case "scrollValue":
        onScroll?.(data.data);
        break;
      case "scrollpercent":
        context.player.scrollProcent = data.data;
        break;
      case "bottomReched":
      case "Next":
        if (!loader.loading)
          bottomReched?.();
        break;
      case "topReched":
      case "Prev":
        if (!loader.loading)
          topReched?.();
        break;
      case "click":
        click?.(data.data);
        break;
      case "data":
        loadCss();
        //alert("loading data")
        loadHtmlContent();
        state.refItem.firstLoad = true;
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
        //  state.refItem.loading = false;
        break;
      case "Image":
        let images = await context.player.getImage(
          ...data.data
        )
        postMessage(
          "images",
          images,
          "window.renderImage"
        );


        break;
    }
  };

  context.useEffect(
    () => {
      if (!context.player.showPlayer || !context.player.highlightedText || !context.player.highlightedText.text)
        return;
      let json = JSON.stringify({
        block: "nearest",
        inline: "start",
        all: !(context.appSettings.voiceWordSelectionsSettings?.appendSelection ?? false),
        scroll: true,
        selector: ".HTMLcontent >p",
        text: context.player.highlightedText.text,
        index: context.player.highlightedText.index,
        length: context.player.highlightedText.length
      });
      state.refItem.webView?.injectJavaScript(`
        try{
          window.highlight(${json});
        }catch(e){
          if (window.__DEV__)
            alert(e)
        }
          true;
    `);
    },
    "player.highlightedText",
    "appSettings"
  );

  return (
    <>
      <View css="absolute he:5 wi:100% le:1 bo:0 zi:99 juc:space-between ali:center clb">
        <Scroller />
      </View>
      <View css="row absolute bo:1 ri:10 zi:99 juc:center ali:center clb">
        <Clock />
        <BattariView
          color={
            context.appSettings.backgroundColor
          }
        />
      </View>
      {loader.elem}
      {render(null, {
        injectedJavaScriptBeforeContentLoaded: jsScript,
        source: {
          html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width,  initial-scale=1" />
              <style class="custom">
                body {
                  background:${context.appSettings.backgroundColor};
                }
              </style>
            </head>
            <body class="${context.player.novel.type}"></body>
          </html>
          `,
          basUrl: ""
        },
        style: {
          backgroundColor: context.appSettings.backgroundColor
        },
        containerStyle: [
          {
            backgroundColor: context.appSettings.backgroundColor,
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
