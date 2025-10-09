import * as React from "react";
import { View, AnimatedView, Text, TouchableOpacity, ProgressBar, ButtonGroup, Icon, Button } from "react-native-short-style";
import ItemList from "./ItemList";
import TextInput from "./TextInputView";
import WebView from "react-native-webview";
import { HttpHandler } from "../native";

const stringToArray = (str: string) => {
    let arr = [];
    for (let i = 0; i < str.length; i++) {
        arr.push(str.charCodeAt(i))
    }

    return arr;
}

const webHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?autoload=true&amp;skin=sunburst&amp;lang=css" defer=""></script>


</head>
<body>

<pre class="prettyprint linenums">

</pre>
<script>
function getData(){
    try{
    window.ReactNativeWebView.postMessage("data");
    }catch(e){
      alert(e)
    }
}

const arrayBuffer = (arr)=>{
          let str = "";
          for(let a of arr){
             str += String.fromCharCode(a);
          }
            return str;
}

function setData(data){
  try{
       let html = arrayBuffer(data);
    document.querySelector(".prettyprint").textContent= html;
    document.querySelector(".prettyprint").classList.remove("prettyprinted")
    PR.prettyPrint();
    
    }catch(e){
      alert(e)
    }

}

</script>



</body>
</html>

`

const WebNoverTester = () => {
    const state = buildState(() =>
    ({
        text: "https://www.lightnovelpub.com/novel/is-it-bad-that-the-main-characters-a-roleplayer",
        url: "",
        refItem: { html: "" }
    })).ignore("refItem").build();

    let webView = useRef<WebView>()

    const getHtml = async () => {
        let handler = new HttpHandler();
        const html = await handler.get_html(state.url);
        state.refItem.html = html.text;
        if (!webView.current)
            alert("eeror")
        let jsonString = JSON.stringify(stringToArray(state.refItem.html))
        console.log("length", state.refItem.html.length)

        webView.current.injectJavaScript(`
        setData(${jsonString});
         true;
         `)

    }



    return (
        <View css="invert flex mat-20">
            <View css="row wi-100% juc-center ali-center he-20 bo-2 boc-gray ma-5">
                <View css="wi-90%">
                    <TextInput
                        defaultValue={state.text}
                        onChangeText={txt => {
                            state.text = txt;
                        }}
                        disableFullscreenUI={true}
                        enterKeyHint="search"
                        inputMode="search"
                        onSubmitEditing={() => {
                            state.url = state.text;
                            getHtml();
                        }
                        }
                        placeholder="Search Novels"
                        style={{ width: "100%", height: "70%" }}
                        css="he:90% clearwidth bow:1 bor:3 desc fos:14 boc:#ccc pal:10"
                    />
                </View>
                <Button text="Seacrh" css="mal-10" onPress={() => {
                    state.url = state.text;
                    getHtml();
                }
                } />
            </View>
            <View css="clearwidth mih:50 he-95% overflow invert">
                <WebView
                    ref={webView}
                    nestedScrollEnabled={true}
                    cacheEnabled={true}
                    source={{
                        html: webHtml
                    }}
                    onMessage={({ nativeEvent }) => {
                        alert(nativeEvent.data)
                        //  webView.current?.postMessage(state.html)
                    }}
                    contentMode="mobile"
                    scalesPageToFit={true}
                    originWhitelist={["*"]}
                    scrollEnabled={true}
                    userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
                    setSupportMultipleWindows={false}
                    style={
                        {
                            flexGrow: 1,
                            zIndex: 70,
                            flex: 1
                        }
                    }
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    allowUniversalAccessFromFileURLs={
                        true
                    }
                    javaScriptEnabled={true}
                />
            </View>
        </View>
    )


}

export default WebNoverTester;