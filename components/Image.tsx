import { Image } from "react-native";
import { useState, useEffect } from "react";
let noImage = require("../assets/noimage.png");
export default ({
  style,
  url,
  css
}: {
  style: any;
  url: string;
  css: string;
}) => {
  const [imgSize, setImgSize] = useState({});
  const [source, setSource] = useState(noImage);
  let loadImage = () => {
    let g = require("../GlobalContext").default;
    if (url && url.toString().startsWith("[")) {
      // image selector
      g.parser
        .current()
        .fetchSelectorImage(url)
        .then(x => setSource(x))
        .catch(x => {});
    } else if (url && url.toString().startsWith("file")) {
      g.imageCache()
        .read(url)
        .then(x => setSource(x));
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
      style={[imgSize, ...st]}
    />
  );
};
