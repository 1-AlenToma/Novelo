import React from "react";
import WebView from "react-native-webview";
import { View } from "react-native";
const jsScript = `
try{
window.__DEV__ = ${__DEV__.toString().toLowerCase()};
if (document.readyState === "loading") {
document.addEventListener("load", (event) => {
#
});
}else {
#
}
}catch(e){
if (window.__DEV__)
   alert(e)
}
true;
`;

export default () => {
    context.hook("html.data");

    useEffect(() => {
        return () => {
            context.html.data = [];
        }
    }, [])

    return (
        <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: "hidden"
        }}>
            {
                context.html.data.map(x => (
                    <WebView
                        key={x.id}
                        injectedJavaScript={`
                      function sleep(ms){
                            return new Promise((r)=> setTimeout(r,ms))
                       }
                       window.sleep = sleep;
                        window.getHtml = async function(){
                          var payload = {
                              id: "${x.id}",
                              data: document.documentElement.innerHTML
                            };
                           window.ReactNativeWebView.postMessage(JSON.stringify(payload));
                          
                        }
                        ${jsScript.replace(/\#/g, " window.getHtml();")}
                      `}
                        cacheEnabled={true}
                        source={{
                            uri: x.url
                        }}
                        onMessage={async ({ nativeEvent }) => {
                            let data = JSON.parse(nativeEvent.data);
                            context.html.data.find(x => x.id == data.id)?.func(data.data as any)
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