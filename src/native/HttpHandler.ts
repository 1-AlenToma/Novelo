import { Ajax, WebViewProps } from "Types";
import Html from "./Html";
import MapCacher from "./MapCacher";

const tempData = new MapCacher<HttpTemp>(300);

const createKey = (...args) => {
  return JSON.stringify(args).replace(/(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\’)/gim, "");
};


const getFetch = async (
  url: string,
  options: any,
  ignoreAlert: boolean,
  fromWebView?: boolean,
  props?: WebViewProps
) => {
  let key = createKey({ url, options });
  try {
    if (tempData.has(key))
      return tempData.get(key);
    let data = fromWebView ? await htmlContext.html.get_html(url, props) : await fetch(url, {
      ...options
    });
    if (data.ok) {
      let text = await data.text();
      let item = new HttpTemp(text, key);
      if (text !== "")
        tempData.set(key, item);
      return item;
    } else {
      if (data.status === 404)
        throw new Error("404, Not found");
      if (data.status === 500)
        throw new Error(
          "500, internal server error"
        );
      if (
        data.status === 408 ||
        data.status == 429
      )
        throw new Error(
          `${data.status} Request Timeout`
        );
      // For any other server error
      throw new Error(data.status.toString());
    }
  } catch (e) {
    tempData.delete(key);
    throw e;
  }
};

class HttpTemp {
  value: string;
  key: string;
  date: Date;
  constructor(value: string, key: string) {
    this.key = key;
    this.value = value;
    this.date = new Date();
  }
  async text() {
    return this.value;
  }
}
class HttpValue {
  value: string;
  baseUrl?: string;
  httpError?: HttpError;
  constructor(
    value: string,
    baseUrl?: string,
    httpError?: HttpError
  ) {
    this.value = value;
    this.baseUrl = baseUrl || "";
    this.httpError = httpError;
  }

  cleanUnfinishedAttributes(html) {
    return html.replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
      // Match only properly formatted attributes with non-empty values
      const validAttrs = (attrs.match(/\b[a-zA-Z0-9-]+="[^"]+"/g) || [])
        .filter(attr => !/=[\s*]""/.test(attr)); // Remove empty attributes

      return `<${tag}${validAttrs.length ? " " + validAttrs.join(" ") : ""}>`;
    }).replace(/\s+>/g, ">"); // Remove unnecessary spaces before '>'
  }

  get html() {
    return new Html(this.cleanUnfinishedAttributes(this.value.replace(/(?<!^)(\w| )(\/p\>)|([a-z]+="\s*")/gmi, "")), this.baseUrl);
  }

  get text() {
    return this.value;
  }

  get json() {
    let text = this.value;
    try {
      if (
        text.indexOf("{") !== -1 ||
        text.indexOf("[") != 1
      )
        return JSON.parse(text);
    } catch (e) { }
    return text;
  }
}

class HttpError {
  message: string;
  constructor(e: any) {
    this.message = e.message;
  }

  isNetwork() {
    return (
      this.message &&
      (this.message.has("network") ||
        this.message.has("Request Timeout"))
    );
  }

  toString() {
    return this.message;
  }
}

class HttpHandler {
  ignoreAlert: boolean = false;
  httpError?: HttpError;
  constructor(ignoreAlert?: boolean) {
    this.ignoreAlert = ignoreAlert === true;
  }
  header(options?: any) {
    this.httpError = undefined;
    return {
      headers: {
        cache: 'no-store',
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
        ...options
      }
    };
  }

  queryString(url: string, item: any) {
    for (let key in item) {
      if (url.indexOf("?") == -1)
        url += "?" + key + "=" + item[key];
      else url += "&&" + key + "=" + item[key];
    }
    return url;
  }

  async get_html(
    url: string,
    baseurl?: string,
    item?: any
  ) {
    try {
      if (item) url = this.queryString(url, item);
      console.info("get_html", url);
      const data = await getFetch(url, this.header(), this.ignoreAlert);
      return new HttpValue(data ? await data.text() : "", baseurl || url);
    } catch (e) {
      console.error("httget", e);
      this.httpError = new HttpError(e);
      return new HttpValue(
        "<div></div>",
        url,
        this.httpError
      );
    }
  }

  async web_view(
    url: string,
    baseurl?: string,
    item?: { props?: WebViewProps }
  ) {
    try {
      const props = item?.props;
      if (props)
        delete item.props;
      if (item) url = this.queryString(url, item);
      console.info("web_view", url);
      const data = await getFetch(url, this.header(), this.ignoreAlert, true, props);
      return new HttpValue(data ? await data.text() : "", baseurl || url);
    } catch (e) {
      console.error("httget", e);
      this.httpError = new HttpError(e);
      return new HttpValue(
        "<div></div>",
        url,
        this.httpError
      );
    }
  }

  async formPost(url: string, item: any) {
    try {
      var data = new FormData();
      for (let k in item) {
        data.append(k, item[k]);
      }
      let res = await getFetch(
        url,
        {
          ...this.header(),
          method: "POST",
          body: data
        },
        this.ignoreAlert
      );
      return new HttpValue(await res.text());
    } catch (e) {
      this.httpError = new HttpError(e);
      console.error(e);
      return null;
    }
  }

  async encodedPost(url: any, item: any) {
    try {
      var formBody: any = [];
      for (var property in item) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(item[property]);

        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      const res = await getFetch(
        url,
        {
          body: formBody,
          method: "POST",
          ...this.header({ "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" })
        },
        this.ignoreAlert
      );

      return new HttpValue(await res.text());
    } catch (e) {
      this.httpError = new HttpError(e);
      console.error(e);
      return null;
    }
  }

  imageUrlToBase64(url: string, header?: any) {
    try {
      console.log(
        "getting image for",
        url?.substring(0, 150)
      );
      if (!url || url.isBase64String()) {
        console.info("url is a base64 or empty");
        return url;
      }
      header = header ?? {};
      if (typeof url == "string" && url.has("header")) {
        let h = JSON.parse(url.split("header")[1].substring(1));
        url = url.split("header")[0].trim();
        for (let k in h)
          header[k] = h[k];
      }
      return new Promise(
        async (onSuccess, onError) => {
          try {
            const response = await fetch(url, {
              ...this.header(header),
            });
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onerror = function (e) {
              console.error(e);
              onSuccess(new HttpError(e));
            }
            reader.onload = function () {
              if (reader.result)
                onSuccess(`data:image/jpg;base64,${reader.result.toString().safeSplit(",", 1)}`);
            };
            reader.readAsDataURL(blob);
          } catch (e) {

            console.error(e);
            onSuccess(new HttpError(e));
          }
        }
      );
    } catch (e) {
      console.error("HttpError", e);
      return new HttpError(e);
    }
  }
}
export default HttpHandler;
