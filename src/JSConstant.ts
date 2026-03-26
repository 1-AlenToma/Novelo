import { WebViewFetchData } from "./Types";

export const jsScript = (js: string, fn: "load" | "DOMContentLoaded", timer: number = 0) => (/*js*/ `
try{
window.__DEV__ = ${(typeof __DEV__ !== "undefined" ? __DEV__ : false).toString().toLowerCase()};
if (document.readyState === "loading") {
document.addEventListener("${fn}", (event) => {
  setTimeout(()=> {${js}}, ${timer ?? 0})
}, { once: true });
}else {
  setTimeout(()=> {${js}}, ${timer ?? 0})
}
}catch(e){
if (window.__DEV__)
   alert(e)
}`);

export const dataPost = (id) => {
    return `
    const postData = async (type, data) => {
        const id= "${id}";
        let item = {
            type,
            id,
            data
        };
        if (typeof data == "object") item = {
            type,
            id,
            ...data
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(item));
    };
    window.postData = postData;`
}

export const webViewCheckVerification = () => {
    const js = `
${dataPost("protection")}
window.checkProtection = () => {
  const protection = [
    "Verifying you are human",
    "Enable JavaScript and cookies to continue",
    "Performing security verification",
    "Checking your browser before accessing",
    "Please wait while we verify",
    "DDoS protection by Cloudflare",
    "cf-browser-verification",
    "Attention Required! | Cloudflare"
  ];

  const text = document.documentElement.outerHTML.toLowerCase();
  const isProtected = protection.some(p => text.includes(p.toLowerCase()));
  window.postData("pCheck", isProtected)
}
true;`;
    return js;
}

export const htmlGetterJsCode = (x: WebViewFetchData) => {

    let data = /*js*/ `
    ${dataPost(x.id)}
    try {
    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    const addString = (...item) => {
        return item.join("");
    };

     async function formPost(ajax) {
         try {
             var data = new FormData();
             if (Array.isArray(ajax.query)) {
                 ajax.query.forEach(x => {
                     data.append(x.key, x.value);
                 })
             } else if (ajax.query) {
                 for (let k in ajax.query) {
                     data.append(k, ajax.query[k]);
                 }
             }

             const res = await fetch(ajax.url, {
                 method: ajax.type.toUpperCase(),
                 body: data
             });

             const text = await res.text();

             postData("ajax", {
                 data: text
             })
         } catch (e) {
             postData("error", e.message);
         }
     }

    async function encodedPost(ajax) {
        try {
            const res = await fetch(ajax.url, {
                method: ajax.type.toUpperCase(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: new URLSearchParams({
                    ...ajax.query
                })
            });

            const text = await res.text();

            postData("ajax", {
              data: text
            })
        } catch (e) {
            postData("error", e.message);
        }
    }



    const props = ${x.props ? JSON.stringify(x.props) : "null"};
    window.sleep = sleep;

    function fetchWebPToBase64(url, referer) {
        return new Promise(async (resolve) => {
            try {
                referer = referer ?? window.location.origin;

                const response = await fetch(url, {
                    headers: {
                        "Referer": referer,
                        "User-Agent": navigator.userAgent,
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

    window.getHtml = async function() {
        let protection = ["Verifying you are human", "Enable JavaScript and cookies to continue", "Performing security verification", "Checking your browser before accessing", "Please wait while we verify", "DDoS protection by Cloudflare", "cf-browser-verification", "Attention Required! | Cloudflare"]

        if (props && props.protectionIdentifier && props.protectionIdentifier.length > 0)
            protection = [...protection, ...props.protectionIdentifier];
        let text = document.documentElement.outerHTML;
        const pr = protection.find((x) => text.toLowerCase().indexOf(x.toLowerCase()) !== -1)
        if (pr) {
            var payload = {
                data: "${x.url}",
            };

            postData("protection", payload);
            return;
        }

        if (props?.ajax){
          if(props.ajax.method == "encodedPost"){
            encodedPost(props.ajax);
          }
          
          if (props.ajax.method == "formPost")
            {
              formPost(props.ajax);
            }
            return;
        }

        if (props?.imageSelector) {
            const {
                selector,
                attr,
                regexp,
                referer
            } = props.imageSelector;
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
            data: text,
        };
        postData("html", payload);
    };

     ${jsScript(" window.getHtml()", "DOMContentLoaded", x.props?.timer)}
} catch (e) {
    if (window.__DEV__) alert(e);
    postData("error", e.message);
}
true;`;

    return data;
};