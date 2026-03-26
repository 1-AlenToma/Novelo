import StateBuilder, { newId } from "react-smart-state";
import { WebViewFetchData, WebViewProps } from "./Types";

const contextData = StateBuilder({
    html: {
        data: [] as WebViewFetchData[],
        updatedNr: 0,
        get_html: (url: string, props?: WebViewProps) => {
            return new Promise<{ text: () => string, ok: boolean, status: number }>((success) => {
                const id = newId();
                let data = contextData as any;
                const update = () => {
                    data.html.updatedNr = data.html.updatedNr >= 1000 ? 1 : data.html.updatedNr + 1;
                }
                const dt = {
                    created: new Date(),
                    props,
                    url: url,
                    id,
                    baseUrl: methods.baseUrl(url),
                    func: async (str: string) => {
                        await success({ text: () => str, ok: str && str.length > 5, status: 0 })
                        let index = data.html.data.findIndex(x => x.id == id);
                        if (index != -1) {
                            data.html.data.splice(index, 1);
                            update();
                        }
                    },
                }

                data.html.data.push(dt);
                if (data.html.data.length <= 3)
                    update();
            })

        }
    }
}).ignore("html.data").globalBuild()

export default contextData;