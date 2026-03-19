import * as httpService from 'react-native-nitro-http-server';
import { NetworkInfo } from 'react-native-network-info';
import { jsScript } from "JSConstant";
import { CSSStyle, JS } from "../assets/readerJs";
import { Asset } from "expo-asset";
import Fonts from "../assets/Fonts";
import MapCacher from "./MapCacher";
import { Base64 } from 'js-base64';


const tempImageData = new MapCacher<any>(200);

class HttpServer {
    address: string = "";
    port: number = 61735;
    lastPageCache: string = "Ok";
    private ip: string = "";
    private started: boolean = false;
    private server?: httpService.HttpServer;

    async setIp() {
        let ip = await NetworkInfo.getIPAddress();
        this.ip = ip && /[1-9]/g.test(this.ip) && __DEV__ ? ip : "127.0.0.1";
        this.address = `http://${this.ip}:${this.port}/${context.version}`;
    }

    getRoute(route: string) {
        return `/${context.version}${route}`;
    }

    queryString = (path, route) => {
        const routeParts = route.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);

        const result = {};

        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const pathPart = pathParts[i];

            if (routePart.startsWith('{') && routePart.endsWith('}')) {
                const key = routePart.slice(1, -1);
                result[key] = decodeURIComponent(pathPart);
            }
        }

        return result as any;
    };

    async start() {
        await this.setIp();
        if (this.started) return;
        this.started = true;
        this.server = new httpService.HttpServer();
        this.server.start(this.port, async (request) => {
            const { method, path } = request;
            //console.log(`Received request: ${method} ${path}`, request);
            // parse paramsJson if any
            let paramsJson: any = {};
            try {
                if (request.body) paramsJson = JSON.parse(request.body);
            } catch (e) { }
            try {
                // ----------------------
                // ROUTING
                // ----------------------
                if (path === this.getRoute("/getLastPage") && method === "GET") {
                    return {
                        statusCode: 200,
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "text/html; charset=UTF-8"
                        },
                        body: this.lastPageCache,
                    };
                }

                if (path === this.getRoute("/novelCss") && method === "GET") {
                    return {
                        statusCode: 200,
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "text/css; charset=utf-8"
                        },
                        body: CSSStyle,
                    };
                }

                if (path.startsWith(this.getRoute("/novelFonts/")) && method === "GET") {
                    try {
                        const fontName = paramsJson.fontName || path.split("/").pop();

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
                        return { statusCode: 500, body: "Error" };
                    }
                }

                // ----------------------
                // IMAGES (return bytes)
                // ----------------------
                if (path.startsWith(this.getRoute("/images/")) && method === "GET") {
                    try {
                        const { src, id } = this.queryString(path, this.getRoute("/images/{src}/{id}"));
                        const decodedSrc = src.decodeURIComponentSafe();
                        const imgKey = `${decodedSrc}${context.player.book.name}${context.player.currentChapter.name}${context.player.novel.parserName}`;

                        let data = tempImageData.get(imgKey);
                        if (!data) {
                            data = (await context.player.getImage({ src: decodedSrc, id })).firstOrDefault();
                            if (data && data.cn) tempImageData.set(imgKey, data);
                        }

                        if (data && data.cn) {
                            // write data to a temporary file
                            let base64Data = data.cn.toBase64Url().split(',')[1];
                            let uint8 = Base64.toUint8Array(base64Data);
                            // const uint8 = Uint8Array.from(Buffer.from(data.cn.split(',')[1], 'base64'));

                            return {
                                statusCode: 200,
                                headers: {
                                    "Access-Control-Allow-Origin": "*",
                                    "Content-Type": "image/png"
                                },
                                body: uint8.buffer as any, // Nitro supports Uint8Array as binary body
                            };
                        } else {
                            return { statusCode: 404, body: "" };
                        }
                    } catch (e) {
                        console.error("HttpServerError", e);
                        return { statusCode: 500, body: "" };
                    }
                }

                if (path === this.getRoute("/novelScript") && method === "GET") {
                    const jsScriptFn = jsScript(JS, "DOMContentLoaded");
                    return {
                        statusCode: 200,
                        contentType: "application/javascript",
                        headers: { "Access-Control-Allow-Origin": "*" },
                        body: jsScriptFn,
                    };
                }
            } catch (e) {
                console.error("HttpServerError", e);
                return { statusCode: 500, body: "" };
            }

            // fallback
            return { statusCode: 404, body: "Not found" };
        }, this.ip);

        // await this.server.start();
    }

    stop() {
        if (!this.started || !this.server) return;
        this.server.stop();
        this.started = false;
        console.warn("Server stopped");
    }
}

const httpServer = new HttpServer();
export default httpServer;