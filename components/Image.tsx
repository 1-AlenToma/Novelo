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
  useEffect(() => {
    Image.getSizeWithHeaders(
      url,
       {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
        },
      (width, height) => {
        setImgSize({ width, height });
      },
      e => {
        alert(e);
      }
    );
  }, []);
  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  if (css) st.push(css.css());

  return (
    <Image
      source={{
        uri: url,
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
