AssetsLinkEditor.funcMaps("window.tryUntilSuccess", "window.getHtml", "window.timerJs")
let appSettings = AssetsLinkEditor.keys.appSettings;
if (appSettings && typeof appSettings !== "string") {
    Object.assign(window, appSettings);
} else appSettings = {};

AssetsLinkEditor.loadFiles("webMessageHandler");

const requiredCheck = [
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

const blockedCheck = [
    "Sorry, you have been blocked",
    "temporarily blocked",
];

const getCode = function (js, exec) {
    if (typeof js === "function") {
        if (exec)
            js();
        return;
    };
    if (typeof js === "string") {
        try {
            let js = eval(js);
            if (exec && typeof js == "function")
                js();
        } catch (e) {
            return undefined;
        }
    }
};


const timerJs = function (js, timer, exec) {
    try {
        if ((timer ?? 0) < 0)
            return getCode(js, exec);
        clearTimeout(window.globalTimer);
        window.globalTimer = setTimeout(() => {
            getCode(js, exec);
        }, timer ?? 0);
    } catch (e) {
        logger.error(e.toString());
    }
}

const pageReady = function (fn, js, timer) {
    try {
        const eventName = fn || "load";
        const isLoadEvent = eventName === "load";

        // Wait if "loading" (for DOMContentLoaded) or not yet "complete" (for load)
        const shouldWait = isLoadEvent
            ? document.readyState !== "complete"
            : document.readyState === "loading";

        if (shouldWait) {
            const target = isLoadEvent ? window : document;
            target.addEventListener(eventName, () => timerJs(js, timer, true), {
                once: true
            });
        } else {
            timerJs(js, timer, true);
        }
    } catch (e) {
        if (window.__DEV__) alert(e);
        logger.error(e.message);
    }
};


const checkProtection = function () {
    setTimeout(() => {
        const text = document.documentElement.outerHTML.toLowerCase();
        const isProtected = requiredCheck && requiredCheck.some(p => text.includes(p.toLowerCase()));
        postData("pCheck", isProtected, "protection");
    }, 300)
}

const tryUntilSuccess = function (method, ...args) {
    try {
        let fn = getCode(method);
        if (typeof fn !== "function") {
            setTimeout(() => tryUntilSuccess(method, ...args), 10);
            return;
        }
        fn(...args);
    } catch (e) {
        logger.error(e.toString());
    }
}

const postData = async (type, data, id) => {
    id = id ?? appSettings.id;
    let item = {
        type,
        id,
        data
    };

    if (typeof data == "object") {
        item = {
            type,
            id,
            ...data
        }
    }
    postToView(item);
}



const formPost = async function (ajax) {
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

        const options = {
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
        logger.error(e.message);
    }
}

const encodedPost = async function (ajax) {
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
        logger.error(e.message);
    }
}

const fetchWebPToBase64 = async function (url, referer) {
    try {
        referer = referer ?? window.location.origin;
        if (!url || url === "undefined") return null;
        if (url.startsWith("data:")) return url;

        const imgData = await sendRequest("getImage", url);
        if (imgData) {
            return imgData;
        }

        const response = await fetch(url, {
            headers: {
                "Referer": referer,
                "User-Agent": navigator.userAgent,
            },
        });
        if (!response.ok) {
            if (window.__DEV__) logger.error("error fetching image:", url);
            return null;
        }
        const blob = await response.blob();

        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const filePath = await sendRequest("setImage", {
                    url,
                    base64: reader.result
                });
                resolve(filePath);
            };
            reader.onerror = () => {
                if (window.__DEV__) logger.warn("error fetching image:", url);
                resolve(null);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        if (window.__DEV__) logger.warn(e.toString());
        return null;
    }
};


const getHtml = async function (settings) {
    try {
        settings = settings ?? appSettings;
        let protection = requiredCheck;
        const props = settings.props;

        if (props && props.protectionIdentifier && props.protectionIdentifier.length > 0)
            protection = [...protection, ...props.protectionIdentifier];
        let text = document.documentElement.outerHTML;
        const pr = protection.find((x) => text.toLowerCase().indexOf(x.toLowerCase()) !== -1)
        if (pr) {
            let blockedText = blockedCheck.find(x => text.toLowerCase().indexOf(x.toLowerCase()) !== -1)
            var payload = {
                data: {
                    url: settings.url,
                    text: pr,
                    blockedText
                },
            };

            postData("protection", payload, settings.id);
            return;
        }

        if (props?.ajax) {
            if (props.ajax.method == "encodedPost") {
                encodedPost(props.ajax);
            }

            if (props.ajax.method == "formPost") {
                formPost(props.ajax);
            }
            return;
        }

        const domContainer = document.createElement("div");
        domContainer.innerHTML = document.documentElement.outerHTML;

        if (props?.imageSelector) {
            const {
                selector,
                attr,
                regexp,
                referer
            } = props.imageSelector;
            const attrList = (attr ?? "src").split("|");


            // Precompile regexp safely (avoid eval)
            const regex = regexp ? new RegExp(regexp[0].slice(1, regexp[0].lastIndexOf("/")), regexp[0].split("/").pop()) : null;

            // Process all images concurrently (parallel fetching)
            const ProcessImages = async () => {
                const images = Array.from(domContainer.querySelectorAll(selector)).filter(x => !x.classList.contains("validated"));
                const batchSize = 5;
                for (let i = 0; i < images.length; i += batchSize) {
                    const batch = images.slice(i, i + batchSize);
                    await Promise.allSettled(
                        batch.map(async (img) => {
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
                            if (src) {
                                img.removeAttribute("onerror")
                                img.removeAttribute("onload")
                                let originalSrc = src;
                                if (regex) src = src.replace(regex, regexp[1]);

                                let base64 = await fetchWebPToBase64(src, referer);
                                if (!base64 && src !== originalSrc) {
                                    base64 = await fetchWebPToBase64(originalSrc, referer);
                                }

                                if (base64) {
                                    // If source came from a lazy attribute, update both or set 'src' so it renders
                                    img.setAttribute(attrUsed, base64);
                                    if (attrUsed !== "src") {
                                        img.setAttribute("src", base64);
                                    }
                                    img.classList.add("validated");
                                } else logger.warn("image could not be loaded ", src)
                            } else logger.warn("attr not found", src)
                        })
                    );
                }
            }
            await ProcessImages();
            while (requests.size > 0)
                await sleep(100)
            // Reconstruct HTML only once
            text = domContainer.innerHTML;
        }
        if (props && props.selector) {
            text = [...domContainer.querySelectorAll(props.selector)].map((x) => x.outerHTML).join("");
        }

        var payload = {
            data: text,
        };
        postData("html", payload, settings.id);
    } catch (e) {
        logger.error(e.toString());
    }
};

const htmlGetterJsCode = async (isImage) => {
    if (isImage)
        pageReady("DOMContentLoaded", () => getHtml(appSettings), appSettings.props?.timer ?? -1);
}


try {
    const toWindow = {
        postData,
        checkProtection,
        tryUntilSuccess,
        pageReady,
        timerJs,
        getCode,
        requiredCheck,
        sleep,
        formPost,
        logger,
        encodedPost,
        fetchWebPToBase64,
        getHtml,
        htmlGetterJsCode
    };
    Object.assign(window, toWindow);
    pageReady("load", () => {
        postData("loaded", true);
    }, appSettings?.props?.timer ?? 5);
} catch (e) {
    logger.error(e.toString());
}