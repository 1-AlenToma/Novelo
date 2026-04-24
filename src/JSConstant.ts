import { WebViewFetchData } from "./Types";

export const timerJs = (js: string, timer: number = 0) => {
    if ((timer ?? 0) < 0)
        return js;
    return `
    clearTimeout(window.globalTimer);
    window.globalTimer = setTimeout(()=> {${js}}, ${timer ?? 0})`
}

export const tryUntilSuccess = (method: string) => {

    return `
        window.tryUntilSuccess = ()=> {
            if (typeof ${method} !== "function"){
                setTimeout(()=> window.tryUntilSuccess(), 10);
                return;
            }   
            ${method}();
        }

        window.tryUntilSuccess();
    `
}

export const jsScript = (js: string, fn: "load" | "DOMContentLoaded", timer: number = 0) => (/*js*/ `
try{
window.__DEV__ = ${(typeof __DEV__ !== "undefined" ? __DEV__ : false).toString().toLowerCase()};
if (document.readyState === "loading") {
document.addEventListener("${fn}", (event) => {
  ${timerJs(js, timer)}
}, { once: true });
}else {
  ${timerJs(js, timer)}
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

const protecttionList = [
    "Please complete the challenge below to continue",
    "Please complete the security check",
    "Please stand by, while we are checking your browser",
    "Checking if the site connection is secure",
    "Security Check Required",
    "Verifying you are human",
    "Enable JavaScript and cookies to continue",
    "Performing security verification",
    "Checking your browser before accessing",
    "Please wait while we verify",
    "DDoS protection by Cloudflare",
    "cf-browser-verification",
    "Attention Required! | Cloudflare"
];

// scroll resset the icloude cookes so, it wont validate ever
export const scrollToChallange = () => {
    return /*js*/`
    let scrollToChallangeDone = false;
    const scrollToChallange = ()=> {
        if (scrollToChallangeDone || document.body.scrollTop>0)
            return;
        const selectors = [
            "iframe[src*='challenges.cloudflare']",
            "iframe[src*='turnstile']",
            "iframe[src*='captcha']",
            "#cf-challenge-running",
            ".cf-browser-verification",
            "[name='cf-turnstile-response']"
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                el.parentNode.scrollIntoView({
                    behavior: 'instant',
                    block: 'center'
                });
                scrollToChallangeDone= true;
                window.postData("log", "scrolled");
                return;
            }
        }

        setTimeout(scrollToChallange,500);

    };`
}

export const webViewCheckVerification = () => {
    return /*js*/`
${dataPost("protection")}
window.checkProtection = () => {
  const protection = ${JSON.stringify(protecttionList)};
  const text = document.documentElement.outerHTML.toLowerCase();
  const isProtected = protection.some(p => text.includes(p.toLowerCase()));
  window.postData("pCheck", isProtected);
}
true;`;
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
             if (ajax.query && Array.isArray(ajax.query)) {
                 ajax.query.forEach(x => {
                     data.append(x.key, x.value);
                 })
             } else if (ajax.query) {
                 for (let k in ajax.query) {
                     data.append(k, ajax.query[k]);
                 }
             }

             const options ={
                 method: ajax.type.toUpperCase(),
                 body: data
             }

             if (options.method == "GET" || options.method == "HEAD")
                delete options.body;

             const res = await fetch(ajax.url, options);

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
                    if (window.__DEV__)
                       postData("log", "error fetching image:" +url);
                    resolve(null);
                };
            } catch (e) {
                resolve(null);
            }
        });
    }

    window.getHtml = async function() {
        let protection = ${JSON.stringify(protecttionList)}

        if (props && props.protectionIdentifier && props.protectionIdentifier.length > 0)
            protection = [...protection, ...props.protectionIdentifier];
        let text = document.documentElement.outerHTML;
        const pr = protection.find((x) => text.toLowerCase().indexOf(x.toLowerCase()) !== -1)
        if (pr) {
            var payload = {
                data: {
                    url: "${x.url}",
                    text: pr
                },
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
    const isImage =${x.url.isImage(true).toString().toLowerCase()};

     if (isImage)
      ${jsScript("window.getHtml()", "DOMContentLoaded", x.props?.timer ?? -1)}

} catch (e) {
    if (window.__DEV__) alert(e);
    postData("error", e.message);
}
true;`;

    return data;
};