import Html from "./Html";
import g from "../GlobalContext";
const tempData = new Map<string, HttpTemp>();
let lock = false;

const createKey = (...args) => {
  return JSON.stringify(args).replace(
    /(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\’)/gim,
    ""
  );
};

const validateSize = async () => {
  if (tempData.size <= 300) return;
  lock = true;
  while (tempData.size > 100) {
    tempData.delete(
      tempData.entries().next().key
    );
  }
  lock = false;
};

const getFetch = async (
  url: string,
  options: any,
  ignoreAlert: boolean
) => {
  while (lock) await methods.sleep(100);
  await validateSize();
  let key = createKey({ url, options });
  try {
    if (tempData.has(key))
      return tempData.get(key);
    let data = await fetch(url, {
      ...options
    });
    if (data.ok) {
      let text = await data.text();
      let item = new HttpTemp(text, key);
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
      throw new Error(data.status);
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

  get html() {
    return new Html(this.value, this.baseUrl);
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
        ...options,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
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
      const data = await getFetch(
        url,
        this.header(),
        this.ignoreAlert
      );
      return new HttpValue(
        await data.text(),
        baseurl || url
      );
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
      var formBody = [];
      for (var property in item) {
        var encodedKey =
          encodeURIComponent(property);
        var encodedValue = encodeURIComponent(
          item[property]
        );
        formBody.push(
          encodedKey + "=" + encodedValue
        );
      }
      formBody = formBody.join("&");

      const res = await getFetch(
        url,
        {
          body: formBody,
          method: "POST",
          ...this.header({
            "Content-Type":
              "application/x-www-form-urlencoded; charset=UTF-8"
          })
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

  imageUrlToBase64(url: string) {
    try {
      console.log(
        "getting image for",
        url?.substring(0, 150)
      );
      if (!url || url.has("data:image")) {
        console.info("url is a base64 or empty");
        return url;
      }
      return new Promise(
        async (onSuccess, onError) => {
          try {
            const response = await fetch(url, {
              ...this.header()
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
      console.error(e);
      return new HttpError(e);
    }
  }
}
export default HttpHandler;
