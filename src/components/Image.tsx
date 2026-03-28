
import * as React from "react";
import { Image } from "react-native-short-style";
let noImage = require("../assets/noimage.png");
export default ({
  style,
  url,
  css,
  parserName,
  ...props
}: {
  style?: any;
  url: string;
  css?: string;
  parserName?: string;
}) => {
  const state = buildState({
    source: noImage,
    imageSize: parserName ? context.parser.find(parserName)?.settings.imagesSize : undefined,
    header: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Referer: (parserName ? context.parser.find(parserName)?.url : undefined)
    }
  }).ignore("header").build();

  let loadImage = async () => {
    let _source = noImage;
    try {

      if (url && typeof url === "string" && url.startsWith("[")) {
        // image selector
        _source = await context.parser.current.fetchSelectorImage(url);
      } else if (url && typeof url === "string" && !await url.isBase64UrlAsync() && url.toString().isLocalPath(true)) {
        let data = await context.imageCache.read(url.trimStr("/"));
        if (data && !data.empty()) {
          _source = data;
        }

      } else if (url && url.toString().has()) {

        if (typeof url == "string" && url.has("header")) {
          let h = JSON.parse(url.split("header")[1].substring(1));
          if (h.webView) {
            let img = await context.parser.current.http.imageUrlToBase64(url);
            if (typeof img == "string")
              url = img;
          } else {
            url = url.split("header")[0].trim();

            for (let k in h)
              state.header[k] = h[k];
          }
        } else if (url && typeof url == "string" && await url.isBase64UrlAsync())
          url = await url.toBase64UrlAsync();


        _source = url;
      }
    } catch (e) {
      console.error("imageErro", e)
    } finally {
      state.source = _source;
    }
  };

  useEffect(() => {
    // state.source = noImage;
    // setSource(noImage);
    loadImage();
  }, [url]);

  const st = React.useMemo(() => {
    return (style && Array.isArray(style)
      ? [...style, state.imageSize]
      : [style || {}, state.imageSize]);
  }, [style, state.imageSize])

  const source = React.useMemo(() => (
    typeof state.source == "number"
      ? state.source
      : {
        uri: state.source,
        method: "GET",
        headers: {
          ...state.header
        }
      }
  ), [state.source])

  return (
    <Image
      {...props}
      onError={() => state.source = noImage}
      source={source}
      css={css}
      style={st}
    />
  );
};
