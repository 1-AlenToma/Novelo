import StateBuilder, { newId } from "react-smart-state";
import { WebViewFetchData, WebViewProps } from "./Types";

const contextData = StateBuilder({
    html: {
        data: [] as WebViewFetchData[],
        get_html: (url: string, props?: WebViewProps) => {
            return new Promise<{ text: () => string, ok: boolean, status: number }>((success) => {
                const id = newId();
                let data = contextData as any;
                const dt = [...data.html.data, {
                    created: new Date(),
                    props,
                    url: url,
                    id,
                    func: async (str: string) => {
                        await success({ text: () => str, ok: true, status: 0})
                        data.html.data = data.html.data.filter(x => x.id !== id);
                    },
                }] as any;

                data.html.data = dt;
            })

        }
    }
}).globalBuild()

export default contextData;