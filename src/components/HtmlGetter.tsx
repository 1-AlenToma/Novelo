import React from "react";
import WebView from "react-native-webview";
import { View } from "react-native";
import { Modal, Text, useTimer } from "react-native-short-style"
import { WebViewFetchData } from "../Types";
import { htmlGetterJsCode } from "../JSConstant";

const debug = false;
const maxCalls = 3;

const baseUrl = (url: string) => {
  if (!url)
    return "";
  var pathArray = url.split('/');
  let hasProtocol = /(http)(s)?/gim.test(url);
  var protocol = hasProtocol ? pathArray[0] : "";
  var host = hasProtocol ? pathArray[2] : pathArray[0];
  if (host.indexOf("?") != -1)
    host = host.substring(0, host.indexOf("?"))
  return protocol + (hasProtocol ? '//' : "") + host;
}

const ProtectionModal = React.memo(({ url, onHide }: { url?: string, onHide: () => void }) => {
  return (<Modal addCloser={true} css="wi-90% he-90%" isVisible={url != undefined} onHide={onHide}>
    <View style={{ flex: 1, marginTop: 15 }}>
      <Text css="fos-15 fow-bold co-red">
        This {baseUrl(url ?? "")} containe ICloude protection, so you need to validate it from time to time.
        {"\n"}
        Found ICloude protection, please check in the box and close the modal and then reload the page if needed
        {"\n"}
        Note: if you dont find the ICloude protection, then simple close it and continue.
      </Text>
      <WebView
        cacheEnabled={true}
        androidLayerType="software"
        source={{
          uri: url as string
        }}
        contentMode="mobile"
        originWhitelist={["*"]}
        userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
        setSupportMultipleWindows={false}
        style={
          {
            flex: 1
          }
        }
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        javaScriptEnabled={true}
      />

    </View>

  </Modal>)
})

export default () => {
  //htmlContext.hook("html.data");
  const state = buildState(() =>
  ({
    protection: [] as { url: string, id: string }[],
    data: [] as WebViewFetchData[]
  })).timeout(2).build();

  useEffect(() => {
    return () => {
      htmlContext.html.data = [];
    }
  }, [])

  htmlContext.useEffect(() => {
    state.data = [...htmlContext.html.data];
  }, "html.data")





  const htmlData = state.data
    .filter(d => !state.protection.some(x => baseUrl(d.url) === baseUrl(x.url)))
    .filter((item, index, self) =>
      index === self.findIndex(other => baseUrl(other.url) === baseUrl(item.url))
    ).slice(0, maxCalls);

  const protection = state.protection.firstOrDefault() as { url: string, id: string } | undefined;

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
        htmlData.map(x => (
          <WebView
            key={x.id}
            injectedJavaScript={htmlGetterJsCode(x)} 
            cacheEnabled={true}
            source={{
              uri: x.url
            }}
            onMessage={async ({ nativeEvent }) => {
              try {
                let data = JSON.parse(nativeEvent.data);
                // console.log(data)
                switch (data.type) {
                  case "html":
                    htmlContext.html.data.find(x => x.id == data.id)?.func(data.data as any)
                    break;
                  case "protection":
                    console.warn("Icloude found")
                    if (!state.protection.find(x => baseUrl(data.data) == baseUrl(x.url))) {
                      if (!protection)
                        state.protection = [{ url: data.data, id: data.id }]
                      else state.protection.push({ url: data.data, id: data.id });
                    }
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
            userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
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
            javaScriptEnabled={true}
          />))}
    </View>)
}