export const jsScript = /*js*/ `
try{
window.__DEV__ = ${__DEV__.toString().toLowerCase()};
if (document.readyState === "loading") {
document.addEventListener("load", (event) => {
setTimeout(()=> #, timer)
});
}else {
setTimeout(()=> #, timer)
}
}catch(e){
if (window.__DEV__)
   alert(e)
}
`;

export let htmlGetterJsCode = (x: any) => {
    let data = /*js*/ `
    try {
      function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
      }

      const addString = (...item) => {
        return item.join("");
      };

      const postData = async (type, data) => {
        let item = { type, data };
        if (typeof data == "object") item = { type, ...data };
        window.ReactNativeWebView.postMessage(JSON.stringify(item));
      };

      const props = ${x.props ? JSON.stringify(x.props) : "null"};
      window.sleep = sleep;

      function fetchWebPToBase64(url, referer) {
        return new Promise(async (resolve) => {
          try {
       referer =referer ?? window.location.origin;

      const response = await fetch(url, {
        headers: {
          "Referer": referer,
          "User-Agent": navigator.userAgent, // mimic browser
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

      window.getHtml = async function () {
        let protection = ["Verifying you are human"];
        if (props && props.protectionIdentifier && props.protectionIdentifier.length > 0)
          protection = [...protection, ...props.protectionIdentifier];

        let text = document.documentElement.outerHTML;
        if (
          protection.find(
            (x) => text.toLowerCase().indexOf(x.toLowerCase()) !== -1
          )
        ) {
          var payload = {
            id: "${x.id}",
            data: "${x.url}",
          };

          postData("protection", payload);
          return;
        }

       if (props?.imageSelector) {
  const { selector, attr, regexp, referer } = props.imageSelector;
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
          id: "${x.id}",
          data: text,
        };
        postData("html", payload);
      };

      ${jsScript
        .replace(/timer/g, x.props?.timer ?? "0")
        .replace(/\#/g, " window.getHtml()")}
    } catch (e) {
      if (window.__DEV__) alert(e);
    }
    true;
  `;

    return data;
};