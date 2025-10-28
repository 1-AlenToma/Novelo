import React from "react";
import WebView from "react-native-webview";
import { View } from "react-native";
import { Modal, Text, useTimer } from "react-native-short-style"
const jsScript = `
try{
window.__DEV__ = ${__DEV__.toString().toLowerCase()};
if (document.readyState === "loading") {
document.addEventListener("load", (event) => {
setTimeout(()=> #, timer)
});
}else {
setTimeout(()=> #, timer)
}
}catch(e){
if (window.__DEV__)
   alert(e)
}
`;

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
        source={{
          uri: url
        } as any}
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
  htmlContext.hook("html.data");
  const state = buildState(() =>
  ({
    protection: [] as { url: string, id: string }[]
  })).build();

  useEffect(() => {
    return () => {
      htmlContext.html.data = [];
    }
  }, [])



  let jsCode = (x: any) => {
    let data = `
    try {
      function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
      }

      const addString = (...item) => {
        return item.join("");
      };

      const postData = async (type, data) => {
        let item = { type, data };
        if (typeof data == "object") item = { type, ...data };
        window.ReactNativeWebView.postMessage(JSON.stringify(item));
      };

      const props = ${x.props ? JSON.stringify(x.props) : "null"};
      window.sleep = sleep;

      function fetchWebPToBase64(url, referer) {
        return new Promise(async (resolve) => {
          try {
       referer =referer ?? window.location.origin;

      const response = await fetch(url, {
        headers: {
          "Referer": referer,
          "User-Agent": navigator.userAgent, // mimic browser
          },
         });
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = (event) => {
              resolve(null);
            };
          } catch (e) {
            resolve(null);
          }
        });
      }

      window.getHtml = async function () {
        let protection = ["Verifying you are human"];
        if (props && props.protectionIdentifier && props.protectionIdentifier.length > 0)
          protection = [...protection, ...props.protectionIdentifier];

        let text = document.documentElement.outerHTML;
        if (
          protection.find(
            (x) => text.toLowerCase().indexOf(x.toLowerCase()) !== -1
          )
        ) {
          var payload = {
            id: "${x.id}",
            data: "${x.url}",
          };

          postData("protection", payload);
          return;
        }

       if (props?.imageSelector) {
  const { selector, attr, regexp, referer } = props.imageSelector;
  const attrList = attr.split("|");
  const images = Array.from(document.querySelectorAll(selector));

  // Precompile regexp safely (avoid eval)
  const regex = regexp ? new RegExp(regexp[0].slice(1, regexp[0].lastIndexOf("/")), regexp[0].split("/").pop()) : null;

  // Process all images concurrently (parallel fetching)
  const results = await Promise.allSettled(
    images.map(async (img) => {
      let src = "";
      let attrUsed = "";

      // Find first non-empty attribute value
      for (const x of attrList) {
        src = img.getAttribute(x);
        if (src) {
          attrUsed = x;
          break;
        }
      }
      if (!src) return;

      let originalSrc = src;
      if (regex) src = src.replace(regex, regexp[1]);

      let base64 = await fetchWebPToBase64(src, referer);
      if (!base64 && src !== originalSrc) {
        base64 = await fetchWebPToBase64(originalSrc, referer);
      }

      if (base64) img.setAttribute(attrUsed, base64);
    })
  );

  // Reconstruct HTML only once
  text = document.documentElement.outerHTML;
}


        if (props && props.selector) {
          text = [...document.querySelectorAll(props.selector)]
            .map((x) => x.outerHTML)
            .join("");
        }

        var payload = {
          id: "${x.id}",
          data: text,
        };
        postData("html", payload);
      };

      ${jsScript
        .replace(/timer/g, x.props?.timer ?? "0")
        .replace(/\#/g, " window.getHtml()")}
    } catch (e) {
      if (window.__DEV__) alert(e);
    }
    true;
  `;
    //  console.warn(data)
    return data;
  };

  const htmlData = htmlContext.html.data
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
            key={x.id + x.url}
            injectedJavaScript={jsCode(x)}
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
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            javaScriptEnabled={true}
          />))}
    </View>)
}