import { WebViewFetchData } from "./Types";
import { keyBuilder, get } from "./assets/WebAssets";

export const getSystemJS = (settings?: any, methods?: string, ...args: any[]) => {

    try {

        let appSettings = { __DEV__, id: "protection" }
        if (settings && typeof settings == "object")
            Object.assign(appSettings, settings);
        else if (settings)
            appSettings.id = settings;
        let js = keyBuilder("systemJs").key(`appSettings`, appSettings).get();
        if (methods) {
            js += `
            let mData = ${JSON.stringify(args)};
            tryUntilSuccess("${methods}", ...mData);
        `
        }

        return js;
    } catch (e) {
        console.error("SystemJs", e)
        return "";
    }

}