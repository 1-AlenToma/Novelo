import WebView from "react-native-webview";
import * as React from "react";
import useView from "../hooks/useView";
import useTimer from "../hooks/Timer"
import {
  invertColor,
  sleep
} from "../Methods";
import { View, Text as TextView, ProgressBar } from "react-native-short-style";
import BattariView from "./BattariView";
import WebOptions from "../native/WebOptions";
import httpServer from "../native/HttpServer";
import { get } from "../assets/WebAssets";



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
      value: true,
      onPress: () => {
        click();
      }
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

  context.hook("appSettings.backgroundColor", "appSettings.fontName");

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

  const loadCss = async () => {
    let color = context.appSettings.backgroundColor;
    let inverted = invertColor(color);
    let shadow = inverted.has("white") ? "#4e4d4d" : "#919191";
    let shadowLength = (1).sureValue(context.appSettings.shadowLength, true);
    let cssStyle = get("webCss",
      ["fontSize", `${context.appSettings.fontSize}px`],
      [`highlight-co`, `${context.appSettings.voiceWordSelectionsSettings?.color ? invertColor(context.appSettings.voiceWordSelectionsSettings?.color) : color}`],
      [`highlight-bg`, context.appSettings.voiceWordSelectionsSettings?.color ?? inverted],
      [`fontStyle`, (context.appSettings.fontStyle ?? "normal").toLowerCase()],
      ["fontName", context.appSettings.fontName],
      ["text-shadow", `${context.appSettings.use3D ? `1px ${shadowLength}px 1px ${shadow}` : "0"}`],
      ["co", color],
      ["inverted", inverted],
      ["line-height", `${(context.appSettings.lineHeight ?? (context.appSettings.fontSize * context.lineHeight)) + 5}px`],
      ["marginB", `${context.appSettings.sentenceMargin ?? 5}px`]
    )

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
    //  await loadFonts();
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
        paddingLeft: !context.player.isNovelType ? 1 : (5).sureValue(context.appSettings.margin),
        paddingRight: !context.player.isNovelType ? 1 : (5).sureValue(context.appSettings.margin),
        paddingTop: "40px",
        lineHeight: context.player.isNovelType ? context.appSettings.lineHeight ?? (context.appSettings.fontSize * context.lineHeight) : undefined,
        fontSize: context.appSettings.fontSize,
        maxHeight: context.player.isNovelType ? "100%" : undefined,
        overflowY: context.player.isNovelType ? "auto" : "hidden"
      };

      if (context.appSettings.navigationType == "ScrollSnap")
        options.viewStyle.paddingBottom = context.player.paddingBottom();
      const nav = {
        Snap: !context.player.isNovelChapterType || context.player.showPlayer ? undefined : "Pagination",
        Scroll: "Scroll",
        ScrollSnap: "PaginationScroll",
      }

      let scrollType = !context.player.isNovelType ? nav[context.appSettings.navigationType] ?? "PaginationScroll" : context.player.showPlayer ? "Player" : nav[context.appSettings.navigationType] ?? "Pagination";
      options.content = content.content;
      options.scrollDisabled = false;
      options.scrollValue = content.scroll;
      options.scrollType = scrollType as any;
      options.addNext = context.player.hasNext();
      options.addPrev = context.player.hasPrev();
      options.prevText = "Previous Chapter";
      options.nextText = "Next Chapter";
      options.type = context.player.novel.type as any;
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
      // await postMessage("CSS", CSSStyle);// reader style
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
      case "savePage":
        httpServer.lastPageCache = data.data;
        console.warn("Page Save", "size", data.data.length);
        break;
      case "Image":
        let images = await context.player.getImage(...data.data)
        postMessage("images", images, "window.renderImage");


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

  let webHtml = React.useMemo(() => {
    let html = get("webHtml",
      ["backgroundColor", context.appSettings.backgroundColor],
      ["address", httpServer.address],
      ["novelType", context.player.novel.type],
      ["fontName", context.appSettings.fontName])
      return html;
  }, [context.appSettings.backgroundColor, httpServer.address, context.appSettings.fontName, context.player.novel.type]);
  

  return (
    <View css={"flex wi-100% he-100%"} style={{ backgroundColor: context.appSettings.backgroundColor, zIndex: loader.loading ? -1 : undefined }}>
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
        source: {
          html: webHtml,
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
    </View>
  );
};
