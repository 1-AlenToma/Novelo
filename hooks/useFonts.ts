import * as Font from "expo-font";
import Fonts from "../assets/Fonts";
import { useLoader } from "../components";
import { useEffect } from "react";

export default () => {
  const loader = useLoader(true, "Loading Fonts");

  useEffect(() => {
    try {
      loader.show();
      (async () => {
        loader.show();
        await Font.loadAsync({
          ...Fonts
        });
        loader.hide();
      })();
    } catch (e) {
      console.error(e);
    }
  }, []);

  return loader;
};
