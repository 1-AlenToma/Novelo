import { Image } from "react-native";
import { useState, useEffect } from "react";
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
  const [source, setSource] = useState();
  let loadImage = () => {
    if (url && url.startsWith("[")) {
      // image selector
      let g = require("../GlobalContext").default;
      g.parser
        .current()
        .fetchSelectorImage(url)
        .then(x => setSource(x));
    } else setSource(url);
  };
  useEffect(() => {
    loadImage();
    // https://www.novelupdates.com/?s=super_gene&post_type=seriesplans
    //https://www.novelupdates.com/?s=Reincarnation+Of+The+Strongest+Sword+God&post_type=seriesplans
  }, []);
  useEffect(() => {
    loadImage();
  }, [url]);
  if (!source || source.empty()) return null; // for now
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  if (css) st.push(css.css());

  return (
    <Image
      source={{
        uri: source,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
        }
      }}
      style={[imgSize, ...st]}
    />
  );
};
