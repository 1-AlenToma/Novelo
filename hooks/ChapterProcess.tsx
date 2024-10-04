import { UseState} from "../GlobalState";
import {useEffect,useRef} from "react";
import WebView from "react-native-webview";
import {Html} from "../native";

export default ()=>{
  const state = UseState({
    loading: true
  });
  
  const webview = useRef();
  
  context.subscribe(()=>{
     processData();
  },["player.currentChapter"])
  
  useEffect(()=>{
    processData();
  },[]);
  
  let processData =()=>{
    
    let parser = context.parser.find(
        context.player.book.parserName
      );
    if(parser.protectedChapter!== true || state.loading)
        return;
    
    if(context.player.currentChapter.content?.has()){
      return;
    }
    
    state.loading = true;
  }
  
  let currentUrl = context.player.currentChapter?.url;
  let web = (state.loading ? (
     <WebView
            ref={(r)=> webview.current = r}
            injectedJavaScript={`
            function sleep(ms){
            return new Promise((r)=> setTimeout(r,ms))
             }
             window.sleep = sleep;
              window.getHtml = async function(){
                return;
                while(document.body.scrollHeight > (document.documentElement.scrollTop || document.body.scrollTop)){
                  window.scrollTo(0, (document.documentElement.scrollTop || document.body.scrollTop) +100);
                  await window.sleep(5);
                }
                var payload = {
                    name: "html",
                    url:"${currentUrl}",
                    data: document.documentElement.outerHTML
                  };
                 window.ReactNativeWebView.postMessage(JSON.stringify(payload));
                
              }
              window.addEventListener('load', function () {
                 window.getHtml();
                });
            `}
            nestedScrollEnabled={true}
            cacheEnabled={true}
            source={{
              uri: currentUrl
            }}
            onMessage={async ({ nativeEvent })=>{
              let data = JSON.parse(nativeEvent.data);
              //console.warn(data.url, currentUrl)
              if(currentUrl === data.url){
              let parser = context.parser.find(
                 context.player.book.parserName
                );
              let content = false as any;
              if((content= await parser.chapter(new Html(data.data, parser.url)))== false){
              
                // await methods.sleep(1);
                 webview.current.injectJavaScript("window.getHtml();true;");
                 return;
              }
              context.player.currentChapter.content =content;
              console.warn(context.player.novel.type)
             await context.player.getChapterContent("hhvh");
             
             state.loading = false;
              }
            }}
            contentMode="mobile"
            scalesPageToFit={true}
            originWhitelist={["*"]}
            scrollEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"
            setSupportMultipleWindows={false}
            style={[
              {
                flexGrow: 1,
                zIndex: 70,
                flex: 1
              }
            ]}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={
              true
            }
            javaScriptEnabled={true}
          />
    ): null);
    
    return {loading:state.loading, web};
}