
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
  const [source, setSource] = useState(noImage);
  const header = useRef<any>({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    Referer: undefined
  }).current
  const imageSize = parserName ? context.parser.find(parserName)?.settings.imagesSize : undefined;
  const http = context.parser.current.http;
  header.Referer = header.Referer ?? (parserName ? context.parser.find(parserName)?.url : undefined)
  let loadImage = async () => {
    let _source = noImage;
    try {

      if (url && typeof url === "string" && url.startsWith("[")) {
        // image selector
        _source = await context.parser.current.fetchSelectorImage(url);
      } else if (url && typeof url === "string" && !await url.isBase64UrlAsync() && url.toString().isLocalPath(true)) {
        let data = await context.imageCache.read(url.trimStr("/"));
        if (data && !data.empty())
          _source = data;
      } else if (url && url.toString().has()) {

        if (typeof url == "string" && url.has("header")) {
          let h = JSON.parse(url.split("header")[1].substring(1));
          if (h.webView) {
            let img = await http.imageUrlToBase64(url);
            if (typeof img == "string")
              url = img;
          } else {
            url = url.split("header")[0].trim();

            for (let k in h)
              header[k] = h[k];
          }
        } else if (url && typeof url == "string" && await url.isBase64UrlAsync())
          url = await url.toBase64UrlAsync();


        _source = url;
      }
    } catch (e) {
      console.error("imageErro", e)
    } finally {
      setSource(_source);
    }
  };

  useEffect(() => {

    // setSource(noImage);
    loadImage();
  }, [url]);

  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];

  return (
    <Image
      {...props}
      onError={() => setSource(noImage)}
      source={
        typeof source == "number"
          ? source
          : {
            uri: source,
            method: "GET",
            headers: {
              ...header
            }
          }
      }
      css={css}
      style={[...st, imageSize]}
    />
  );
};
