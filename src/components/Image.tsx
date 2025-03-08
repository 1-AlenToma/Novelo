import { Image } from "react-native";
import * as React from "react";
let noImage = require("../assets/noimage.png");
export default ({
  style,
  url,
  css,
  parserName
}: {
  style?: any;
  url: string;
  css?: string;
  parserName?: string;
}) => {
  const [imgSize, setImgSize] = useState({});
  const [source, setSource] = useState(noImage);
  const imageSize = parserName ? context.parser.find(parserName)?.settings.imagesSize : undefined;
  let loadImage = () => {
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
      setSource(url);
    }
  };
  useEffect(() => {
    loadImage();
    // https://www.novelupdates.com/?s=super_gene&post_type=seriesplans
    //https://www.novelupdates.com/?s=Reincarnation+Of+The+Strongest+Sword+God&post_type=seriesplans
  }, []);
  useEffect(() => {
    setSource(noImage);
    loadImage();
  }, [url]);
  // if (!source || source.empty()) return null; // for now
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  if (css) st.push(css.css());

  return (
    <Image
      onError={() => setSource(noImage)}
      source={
        typeof source == "number"
          ? source
          : {
            uri: source,
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
            }
          }
      }
      style={[imgSize, ...st, imageSize]}
    />
  );
};
