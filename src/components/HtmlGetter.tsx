import React, { useMemo } from "react";
import WebView from "react-native-webview";
import { View } from "react-native";
import { Modal, Text, useTimer } from "react-native-short-style"
import { WebViewFetchData } from "../Types";
import { htmlGetterJsCode, jsScript, tryUntilSuccess, webViewCheckVerification } from "../JSConstant";
import Timer from "hooks/Timer";

const debug = false;
const maxCalls = 3;





const webViewDefaultProps = {
  sharedCookiesEnabled: true,
  thirdPartyCookiesEnabled: true,
  javaScriptEnabled: true,
  domStorageEnabled: true,
  cacheEnabled: true,
  // userAgent: "Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"

}

const ProtectionModal = React.memo(({ url, onHide }: { url?: string, onHide: () => void }) => {
  const [isVisible, setIsVisible] = useState(url !== undefined);
  const webView = useRef<WebView>();
  const lastCheck = useRef();
  const checkTimer = Timer(2);
  useEffect(() => {
    if (!isVisible)
      onHide();
  }, [isVisible])

  useEffect(() => {
    if (isVisible && (!url || !url.has()))
      setIsVisible(false);
    else if (!isVisible && url?.has())
      setIsVisible(true)
  }, [url])
  return (<Modal addCloser={true} css="wi-80% he-90%" isVisible={isVisible} onHide={() => setIsVisible(false)}>
    <View style={{ flex: 1, marginTop: 15 }}>
      <Text css="fos-15 fow-bold co-red">
        This {methods.baseUrl(url ?? "")} containe ICloude protection, so you need to validate it from time to time.
        {"\n"}
        Found ICloude protection, please check in the box and close the modal.
        {"\n"}
        Note: if you dont find the ICloude protection, then simple close it and continue.
      </Text>
      <WebView
        ref={webView}
        injectedJavaScriptBeforeContentLoaded={webViewCheckVerification()}
        androidLayerType="software"
        source={{
          uri: url as string
        }}
        onNavigationStateChange={() => {
          webView.current?.injectJavaScript(
            `${jsScript(tryUntilSuccess("window.checkProtection"), "DOMContentLoaded", 20)}
           true;`
          );
        }}
        onMessage={async ({ nativeEvent }) => {
          try {
            let data = JSON.parse(nativeEvent.data);
            //  console.warn("webViw", data)
            if (data.type == "pCheck") {
              if (!lastCheck.current && data.data) {
                lastCheck.current = true;
              } else if (lastCheck.current && !data.data)
                setIsVisible(false)
            }
          } catch (e) {
            console.error(e);
          }

        }}

        {...webViewDefaultProps}
        contentMode="mobile"
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        style={
          {
            flex: 1
          }
        }
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
      />

    </View>

  </Modal>)
})

export default () => {
  htmlContext.hook("html.updatedNr");
  const state = buildState(() =>
  ({
    updateNr: 0,
    protection: [] as { url: string, id: string, baseUrl: string }[],
  })).build();
  const timeout = 1;
  const webViews = useRef<(WebView | null)[]>([]);
  const timers = [useTimer(timeout), useTimer(timeout), useTimer(timeout)]

  useEffect(() => {
    return () => {
      htmlContext.html.data = [];
    }
  }, [])

  htmlContext.useEffect(() => {
    // state.updateNr = htmlContext.html.updatedNr;
  }, "html.updatedNr")



  const iProtected = useMemo(() => {
    /*  htmlContext.html.data.forEach(x => {
        if (state.protection.some(p => p.baseUrl == x.baseUrl)) {
          x.created = new Date();
        }
      });*/

    return htmlContext.html.data.filter(d =>
      !state.protection.some(x => d.baseUrl === x.baseUrl)
    )
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


  const protection = state.protection.firstOrDefault() as { url: string, id: string, baseUrl: string } | undefined;

  const handleHide = React.useCallback(() => {
    state.protection = state.protection.filter(x => x.id !== protection?.id)
  }, [protection?.id]);

  return (
    <View style={!debug ? {
      position: "absolute",
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      overflow: "hidden"
    } : { flex: 1, height: 200 }}>
      <ProtectionModal url={protection?.url} onHide={handleHide} />
      {
        htmlData.map((x, i) => (
          <WebView
            ref={c => webViews[i] = c as any}
            key={x.id}
            injectedJavaScriptBeforeContentLoaded={htmlGetterJsCode(x)}
            {...webViewDefaultProps}
            source={{
              uri: x.url
            }}
            onNavigationStateChange={() => {
              if (x.url.isImage(true))
                return;
              timers[i](() => {
                webViews[i]?.injectJavaScript(`${jsScript(tryUntilSuccess("window.getHtml"), "DOMContentLoaded", (x.props?.timer ?? -1))}
                true;`)
              });
            }}
            onError={(e) => {
              x.func("")
              console.error("WebViewLoadError", x.url, e);
            }}
            onHttpError={(e) => {
              x.func("")
              console.error("WebViewError", x.url, e);
            }}
            onMessage={async ({ nativeEvent }) => {
              try {
                let data = JSON.parse(nativeEvent.data);
                // console.log(data)
                switch (data.type) {
                  case "html":
                  case "ajax":
                    htmlContext.html.data.find(x => x.id == data.id)?.func(data.data as any)
                    break;
                  case "protection":
                    console.warn("Icloude found")
                    if (!state.protection.find(x => methods.baseUrl(data.data) == x.baseUrl)) {
                      if (!protection)
                        state.protection = [{ url: data.data, id: data.id, baseUrl: methods.baseUrl(data.data) }]
                      else state.protection.push({ url: data.data, id: data.id, baseUrl: methods.baseUrl(data.data) });
                    }
                    break;
                  case "error":
                    htmlContext.html.data.find(x => x.id == data.id)?.func("")
                    console.error("WebViewError", data);
                    break;
                  default:
                    console.warn(data)
                    break;

                }
              } catch (e) {
                console.error(e);
              }

            }}
            contentMode="mobile"
            originWhitelist={["*"]}
            setSupportMultipleWindows={false}
            style={
              {
                zIndex: -1,
              }
            }
            androidLayerType="software"
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
          />))}
    </View>)
}