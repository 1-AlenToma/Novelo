
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
  const [imgSize, setImgSize] = useState({});
  const [source, setSource] = useState(noImage);
  const header = useRef({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    Referer: undefined
  }).current
  const imageSize = parserName ? context.parser.find(parserName)?.settings.imagesSize : undefined;
  let loadImage = async () => {
    try {
      if (url && url.toString().startsWith("[")) {
        // image selector
        context.parser
          .current
          .fetchSelectorImage(url)
          .then(x => setSource(x))
          .catch(x => { });
      } else if (url && typeof url === "string" && url.toString().isLocalPath(true)) {
        context.imageCache.read(url.trimStr("/")).then(x => {
          if (x && !x.empty())
            setSource(x)
        });
      } else if (url && url.toString().has()) {

        if (typeof url == "string" && url.has("header")) {
          let h = JSON.parse(url.split("header")[1].substring(1));
          url = url.split("header")[0].trim();
          for (let k in h)
            header[k] = h[k];
        } else if (url && typeof url == "string" && url.isBase64String())
          url = url.toBase64Url();
        setSource(url);
      }
    } catch (e) {
      console.error("imageErro", e)
    }
  };

  useEffect(() => {
    setSource(noImage);
    loadImage();
  }, [url]);
  // if (!source || source.empty()) return null; // for now
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
      style={[imgSize, ...st, imageSize]}
    />
  );
};
