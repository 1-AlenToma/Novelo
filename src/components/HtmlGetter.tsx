import React, { useMemo } from "react";
import WebView, { WebViewProps } from "react-native-webview";
import { View } from "react-native";
import { Modal, Text, useTimer } from "react-native-short-style"
import { WebViewFetchData } from "../Types";
import { getSystemJS } from "../JSConstant";
import { funcMapper, IFileNames, IFuncMapper } from "../assets/WebAssets";
import { PrimitiveObject } from "react-smart-state";

const debug = false;
const maxCalls = 3;


const webViewDefaultProps = {
  sharedCookiesEnabled: true,
  thirdPartyCookiesEnabled: true,
  javaScriptEnabled: true,
  domStorageEnabled: true,
  cacheEnabled: true,
  incognito: false,
  androidLayerType: "software",
  allowUniversalAccessFromFileURLs: true,
  contentMode: "mobile",
  originWhitelist: ["*"],
  setSupportMultipleWindows: false,
  allowFileAccess: true,
  allowFileAccessFromFileURLs: true,
  // userAgent: "Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"

} as WebViewProps;

const blackListed = {}

const webViewProtectedJS = getSystemJS("protection");
const ProtectionModal = React.memo(({ item, onHide }: { item?: WebViewFetchData, onHide: () => void }) => {
  const { locMem } = useFunc();
  const isVisible = PrimitiveObject(item?.url !== undefined);
  const webView = useRef<IFuncMapper<"systemJs">>();
  const lastCheck = useRef();
  const { url, tried, baseUrl } = (item ?? {})
  useEffect(() => {
    if (!isVisible.value)
      onHide();
  }, [isVisible.value])

  useEffect(() => {
    if (isVisible.value && (!url || !url.has()))
      isVisible.value = false;
    else if (!isVisible.value && url?.has())
      isVisible.value = true;
  }, [url])
  return (<Modal addCloser={true} css="wi-80% he-90%" isVisible={isVisible.value} onHide={locMem(() => isVisible.value = false)}>
    <View style={locMem({ flex: 1, marginTop: 15 })}>
      <Text css="fos-15 fow-bold co-red">
        This {baseUrl} containe ICloude protection, so you need to validate it from time to time.
        {"\n"}
        Found ICloude protection, please check in the box and close the modal.
        {"\n"}
        Note: If you dont find the ICloude protection, then simple close it and continue.
        {"\n"}
        Tries left:{4 - (tried ?? 0)}
      </Text>
      <WebView
        ref={locMem<any>((c) => {
          if (c !== null)
            webView.current = funcMapper(c);
        }, url)}
        injectedJavaScriptBeforeContentLoaded={webViewProtectedJS}
        source={locMem<any>({
          uri: url as string
        }, url)}
        onNavigationStateChange={locMem(() => {
          /*  webView.current?.injectJavaScript(
              `${jsScript(tryUntilSuccess("window.checkProtection"), "DOMContentLoaded", 20)}
             true;`
            );*/
        })}
        onMessage={locMem(async ({ nativeEvent }) => {
          try {
            let data = JSON.parse(nativeEvent.data);
            if (data.type == "loaded") {
              console.info("webView loaded");
              webView.current?.exec("window.timerJs(()=> window.checkProtection(), 20, true);");
              return;
            }
            //  console.warn("webViw", data)
            if (data.type == "pCheck") {
              if (!lastCheck.current && data.data) {
                lastCheck.current = true;
              } else if (lastCheck.current && !data.data)
                isVisible.value = false;
            } else console.warn(data)
          } catch (e) {
            console.error(e);
          }

        }, url)}

        {...webViewDefaultProps}
        userAgent={item?.props?.userAgent}

        style={
          locMem<any>({
            flex: 1
          })}
      />

    </View>

  </Modal>)
})

type InFuncMappar<T extends IFileNames> = {
  webview: WebView;
  mapper: IFuncMapper<T>
}


export default () => {
  htmlContext.hook("html.updatedNr");
  const state = buildState(() =>
  ({
    updateNr: 0,
    protection: [] as WebViewFetchData[],
  })).build();
  const timeout = 20000;
  const webViews = useRef<(InFuncMappar<"systemJs"> | null)[]>([]).current;
  const timers = [useTimer(timeout), useTimer(timeout), useTimer(timeout)];
  const { locMem, memKey } = useFunc();

  useEffect(() => {
    return () => {
      htmlContext.html.data = [];
    }
  }, [])

  htmlContext.useEffect(() => {
    // state.updateNr = htmlContext.html.updatedNr;
  }, "html.updatedNr")



  const iProtected = useMemo(() => {
    try {
      return htmlContext.html.data.filter(d =>
        !state.protection.some(x => d.baseUrl === x.baseUrl)
      )
    } catch (e) {
      console.error(e);
      throw "protected could no be verified"
    }
  },
    [htmlContext.html.updatedNr, state.protection]);

  const htmlData = useMemo(() => {
    let unique = iProtected.filter((item, index, self) =>
      index === self.findIndex(o => o.baseUrl === item.baseUrl)
    );

    if (unique.length < maxCalls && iProtected.length >= maxCalls)
      return iProtected.slice(0, maxCalls);

    return unique.slice(0, maxCalls);
  }, [iProtected]);


  const protection = state.protection.firstOrDefault() as WebViewFetchData | undefined;

  const handleHide = React.useCallback(() => {
    state.protection = state.protection.filter(x => x.id !== protection?.id)
  }, [protection?.id]);

  const exec = locMem((data: WebViewFetchData, args?: any) => {
    try {
      data.func(args ?? "");
    } catch {

    }
  })

  return (
    <View style={locMem<any>(!debug ? {
      position: "absolute",
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      overflow: "hidden"
    } : { flex: 1, height: 200 }, debug)}>
      <ProtectionModal item={protection} onHide={handleHide} />
      {
        htmlData.map((x, i) => {
          const waitTime = x.props?.imageSelector ? 1080000 : 20000;
          x.systemJs = x.systemJs ?? `${getSystemJS(x)}\ntrue;`;
          timers[i](() => exec(x), waitTime);
          return (
            <WebView
              ref={c => {
                webViews[i] = {
                  mapper: funcMapper(c),
                  webview: c as any
                }
              }}
              key={x.id}
              userAgent={x.props?.userAgent}
              injectedJavaScriptBeforeContentLoaded={x.systemJs}
              {...webViewDefaultProps}
              source={{
                uri: x.url
              }}
              onError={(e) => {
                x.func("")
                console.error("WebViewLoadError", x.url, e);
              }}
              onHttpError={(e) => {
                // x.func("")
                console.error("onHttpError", i, e.nativeEvent.statusCode);
              }}

              onMessage={async ({ nativeEvent }) => {
                try {

                  let data = JSON.parse(nativeEvent.data);
                  //if (__DEV__)
                  // console.log("wbview msgType", data.type, data.pType,);
                  switch (data.type) {
                    case "html":
                    case "ajax":
                      timers[i].clear();
                      htmlContext.html.data.find(x => x.id == data.id)?.func(data.data as any)
                      break;
                    case "protection":
                      timers[i].clear();
                      console.warn("Icloude found", data.data.text)
                      let xItem = htmlData.find(x => x.id == data.id);
                      if (blackListed[xItem.baseUrl] != undefined && blackListed[xItem.baseUrl] > 2) {
                        xItem.func("");
                        return;
                      }
                      if (xItem.tried > 1 || data.blockedText) {
                        blackListed[xItem.baseUrl] = (blackListed[xItem.baseUrl] ?? 0) + 1;
                        htmlContext.html.data.filter(x => x.baseUrl == xItem.baseUrl).forEach(x => {
                          x.tried = 4
                        });
                        xItem.func("");
                        return; // failed to may times
                      }
                      if (!state.protection.find(x => methods.baseUrl(data.data.url) == x.baseUrl)) {
                        xItem.tried++;
                        if (!state.protection.firstOrDefault())
                          state.protection = [xItem]
                        else state.protection.push(xItem);
                      }
                      break;
                    case "error":
                      timers[i].clear();
                      htmlContext.html.data.find(x => x.id == data.id)?.func("")
                      console.error("WebViewError", data);
                      break;
                    case "loaded":
                      webViews[i].mapper.exec("window.getHtml");
                      timers[i](() => x.func(""), waitTime);
                      break;
                    case "Promise":
                      timers[i].clear();
                      switch (data.pType) {
                        case "getImage":
                          if (!data.data)
                            return webViews[i].webview.postMessage(JSON.stringify({ data: undefined, id: data.id }));
                          let imagePath = x.props.imageSelector.parserName.path(`${data.data.cleanFileName()}.json`);
                          let src = undefined;
                          if (await context.imageTempCache.exists(imagePath))
                            src = `Cached_${imagePath}`;

                          webViews[i].webview.postMessage(JSON.stringify({ data: src, id: data.id }));
                          break;
                        case "setImage":
                          if (!data.data?.url || !data.data?.base64)
                            return webViews[i].webview.postMessage(JSON.stringify({ data: undefined, id: data.id }));
                          let saveImagePath = x.props.imageSelector.parserName.path(`${data.data.url.cleanFileName()}.json`);
                          await context.imageTempCache.write(saveImagePath, `${new Date().toDateString()}\n${data.data.base64}`);
                          webViews[i].webview.postMessage(JSON.stringify({ data: `Cached_${saveImagePath}`, id: data.id }));
                          break;
                      }
                      break;
                    default:
                      console.warn(data)
                      break;

                  }
                } catch (e) {
                  console.error("WebViewMsgError", e);
                }

              }}

              style={
                locMem<any>({
                  zIndex: -1,
                })
              }

            />)
        })}
    </View>)
}