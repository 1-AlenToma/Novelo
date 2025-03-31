import React from "react";
import WebView from "react-native-webview";
import { View } from "react-native";
import { Modal, Text } from "./ReactNativeComponents"
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
`;

const debug = false;

export default () => {
    context.hook("html.data");
    const state = buildState({
        protection: ""
    }).build();

    useEffect(() => {
        return () => {
            context.html.data = [];
        }
    }, [])

    let data = context.html.data;


    let jsCode = (x: any) => {
        let data = `
                        try{
                      function sleep(ms){
                            return new Promise((r)=> setTimeout(r,ms))
                       }
                    
                       const addString =(...item)=> {
                            return item.join("");
                       }

                       const postData = async (type, data)=> {
                            let item = {type, data};
                            if (typeof data == "object")
                                item = {type, ...data};
                            window.ReactNativeWebView.postMessage(JSON.stringify(item));
                       }
                       const props = ${x.props ? JSON.stringify(x.props) : "null"};
                       window.sleep = sleep;
                      function fetchWebPToBase64(url) {
                       return new Promise(async (resolve) => {
                       try{
                       const response = await fetch(url);
                       const blob = await response.blob();
                       
                       const reader = new FileReader();
                       reader.readAsDataURL(blob);
                       reader.onloadend = () => resolve(reader.result);
                       reader.onerror = (event) => {
                       postData("log", event.toString())
                       resolve(null);
                       };
                        }catch(e){
                        postData("log", e.toString())
                       resolve(null);
                        }

                      });
                    }
                       

                        window.getHtml = async function(){
                         let protection =["Verifying you are human"];
                         if (props && props.protectionIdentifier && props.protectionIdentifier.length>0)
                            protection = [...protection, ...props.protectionIdentifier]

                          let text = document.documentElement.outerHTML;
                          if (protection.find(x=> text.toLowerCase().indexOf(x.toLowerCase()) !== -1))
                          {
                            var payload = {
                              id: "${x.id}",
                              data: "${x.url}"
                            };
                        
                            postData("protection", payload);
                            return;
                            
                          }
                          if (props && props.selector){
                            text = [...document.querySelectorAll(props.selector)].map(x=> x.outerHTML).join("");
                          }
                          if (props && props.type == "webp"){
                            let div = document.createElement("div");
                            div.innerHTML = text;
                            let imgs = [...div.querySelectorAll("img")];
                            let counter = 100;
                              postData("log", imgs.length)
                            for(let img of imgs){
                                if (counter<=0)
                                    break;
                                counter--;
                                let src = img.getAttribute("src");
                                if (!src || src.indexOf(".webp") == -1)
                                    continue;
                                let c = await fetchWebPToBase64(src);
                                if (c)
                                img.setAttribute("src", c);
                                
                                
                            }

                            text = div.outerHTML;
                          }

                       
                          var payload = {
                              id: "${x.id}",
                              data: text
                            };
                            postData("html", payload);
                        }
                        ${jsScript.replace(/\#/g, " window.getHtml();")}
                        }catch(e){
                        if (window.__DEV__)
                          alert(e)
                        }
                        true;
                      `;
        //  console.warn(data)
        return data;
    };


    return (
        <View style={!debug ? {
            position: "absolute",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: "hidden"
        } : { flex: 1, height: 200 }}>
            <Modal addCloser={true} css="wi-90% he-90%" isVisible={state.protection.has()} onHide={() => state.protection = ""}>
                <View style={{ flex: 1, marginTop: 15 }}>
                    <Text css="fos-15 fow-bold co-red">
                        This site/parser containe ICloude protection, so you need to validate from time to time.
                        {"\n"}
                        Found ICloude protection, please check in the box and close the modal and then reload the page
                        {"\n"}
                        note: if you dont find the ICloude protection, then simple close it and continue.
                    </Text>
                    <WebView
                        cacheEnabled={true}
                        source={{
                            uri: state.protection
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

            </Modal>
            {
                data.map(x => (
                    <WebView
                        key={x.id}
                        injectedJavaScript={jsCode(x)}
                        cacheEnabled={true}
                        source={{
                            uri: x.url
                        }}
                        onMessage={async ({ nativeEvent }) => {
                            let data = JSON.parse(nativeEvent.data);
                            switch (data.type) {
                                case "html":
                                    context.html.data.find(x => x.id == data.id)?.func(data.data as any)
                                    break;
                                case "protection":
                                    console.warn("Icloude found")
                                    context.html.data.find(x => x.id == data.id)?.func("<div></div>")
                                    state.protection = data.data;
                                    break;
                                default:
                                    console.warn(data)
                                    break;

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