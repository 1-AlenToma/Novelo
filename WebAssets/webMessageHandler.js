const ids = new Map();
const createWebViewUid = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
};

const logger = {
    log: (...args) => {
        if (window.__DEV__) {
            postToView({ type: "log", data: args });
        }
    },
    error: (...args) => {
        if (appSettings)
            args.push(appSettings);

        if (window.__DEV__)
            postToView({ type: "error", data: args });
    },
    warn: (...args) => {
        if (window.__DEV__)
            postToView({ type: "warn", data: args });
    }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const requests = new Map();

const postToView = (item) => {
    window.ReactNativeWebView?.postMessage(JSON.stringify(item));
};

const sendRequest = (type, data, timeoutMs = 1800000) => {
    return new Promise((resolve, reject) => {
        const tempId = createWebViewUid();

        const timer = setTimeout(() => {
            if (requests.has(tempId)) {
                requests.delete(tempId);
                resolve("");
            }
        }, timeoutMs);

        // 1. Register handler FIRST
        requests.set(tempId, {
            resolve: (res) => {
                clearTimeout(timer);
                resolve(res);
            },
            reject: (err) => {
                clearTimeout(timer);
                resolve("");
            }
        });

        // 2. Send message SECOND
        postToView({
            type: "Promise",
            pType: type,
            data,
            id: tempId
        });
    });
};

const handleMessage = (event) => {
    try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.id && requests.has(data.id)) {
            const handler = requests.get(data.id);
            requests.delete(data.id);
            if (data.error) {
                handler.reject(new Error(data.error));
            } else {
                handler.resolve(data.data);
            }
        }
    } catch (e) {
        logger.error("error receeving massage")
        // Ignore non-JSON messages from the host page
    }
};

window.addEventListener("message", handleMessage);
document.addEventListener("message", handleMessage);