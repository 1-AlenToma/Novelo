import * as server from "expo-http-server";
import { NetworkInfo } from "react-native-network-info";
import { jsScript } from "JSConstant";
import { CSSStyle, JS } from "../assets/readerJs";
import { Asset } from "expo-asset";
import Fonts from "../assets/Fonts";
import MapCacher from "./MapCacher";
const tempImageData = new MapCacher<any>(200);

class HttpServer {
    address: string = "";
    port: number = 61735;
    lastPageCarche: string = "Ok";
    private started: boolean = false;
    async setIp() {
        let ip = await NetworkInfo.getIPAddress();
        this.address = ip && /[1-9]/g.test(ip) && __DEV__
            ? `http://${ip}:${this.port}/${context.version}`
            : `http://127.0.0.1:${this.port}/${context.version}`;
    }

    getRoute(route: string) {
        return "/" + context.version + route;
    }
    async start() {
        await this.setIp();
        try {
            if (this.started) return;
            this.started = true;
            server.setup(this.port, (event: server.StatusEvent) => {
                console.warn("SERVER EVENT:", event);
                if (event.status === "ERROR") {
                    // there was an error...
                } else {
                    // server was STARTED, PAUSED, RESUMED or STOPPED
                }
            });


            server.route(this.getRoute("/getLastPage"), "GET", async (request) => {

                try {
                    return {
                        statusCode: 200,
                        statusDescription: "OK - CUSTOM STATUS",
                        contentType: "text/html; charset=UTF-8",
                        headers: {
                            "Access-Control-Allow-Origin": "*", // allow WebView fetch
                        },
                        body: this.lastPageCarche,
                    };
                } catch (e) {
                    console.error(e)
                }
            });


            server.route(this.getRoute("/novelCss"), "GET", async (request) => {
                try {
                    return {
                        statusCode: 200,
                        statusDescription: "OK - CUSTOM STATUS",
                        contentType: "text/css; charset=utf-8",
                        headers: {
                            "Access-Control-Allow-Origin": "*", // allow WebView fetch
                        },
                        body: CSSStyle,
                    };
                } catch (e) {
                    console.error(e)
                }
            });



            server.route(this.getRoute("/novelFonts/{fontName}"), "GET", async (request) => {
                try {
                    const { fontName } = JSON.parse(request.paramsJson);

                    let asset = Asset.fromModule(require("../assets/gfont.ttf"));
                    await asset.downloadAsync();
                    let fontUri = asset.localUri;
                    asset = Asset.fromModule(Fonts[fontName]);
                    await asset.downloadAsync();
                    const fontItem = {
                        icons: fontUri,
                        font: asset.localUri
                    };
                    let css = `
                    @font-face {
                      font-family: 'Material Symbols Outlined';
                      font-style: normal;
                      font-weight: 400;
                      src: url("${fontItem.icons}") format('woff2');
                      }
                      
                    @font-face {
                      font-family: '${fontName}';
                      src: url("${fontItem.font}") format('truetype');
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

                    return {
                        statusCode: 200,
                        contentType: "text/css; charset=utf-8",
                        headers: {
                            "Access-Control-Allow-Origin": "*", // allow WebView fetch
                        },
                        body: css,
                    };
                } catch (e) {
                    console.error(e);
                }
            });


            server.route(this.getRoute("/images/{src}/{id}"), "GET", async (request) => {
                try {
                    // console.error("Request", "/imageAddress", "GET", request);
                    const { src, id } = JSON.parse(request.paramsJson);

                    let data: any = undefined;
                    const img = { src: decodeURIComponent(src), id };
                    let key = img.src + context.player.book.name + context.player.currentChapter.name + context.player.novel.parserName;
                    if (tempImageData.has(key))
                        data = tempImageData.get(key);
                    if (!data) {
                        data = (await context.player.getImage(img)).firstOrDefault();
                        if (data)
                            tempImageData.set(key, data)
                    }
                    if (data) {
                        data.id = id;
                        data.src = src;
                    }

                    return {
                        statusCode: 200,
                        contentType: "application/json",
                        headers: {
                            "Access-Control-Allow-Origin": "*"
                        },
                        body: JSON.stringify(data ?? {})
                    } as any;
                } catch (e) {
                    console.error(e)
                }
            });

            server.route(this.getRoute("/novelScript"), "GET", async (request) => {
                //   console.error("Request", "/script", "GET", request);
                const jsScriptFn = jsScript(JS, "DOMContentLoaded")
                return {
                    statusCode: 200,
                    statusDescription: "OK - CUSTOM STATUS",
                    contentType: "application/javascript",
                    headers: {
                        "Access-Control-Allow-Origin": "*", // allow WebView fetch
                    },
                    body: jsScriptFn,
                };
            });


            server.start();

        } catch (e) {
            console.error(e);
        }

        console.warn("server started", this.address)
    }

    stop() {
        console.warn("Server Stopped");
        this.started = false;
        server.stop();
    }
    reqGet() {

    }
}

const httpServer = new HttpServer();
export default httpServer;