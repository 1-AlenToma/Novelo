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
        console.log("Loading Fonts");
        loader.show();
        if (!__DEV__)
        await Font.loadAsync({
          ...Fonts
        });
        console.log("Font Loaded");
        loader.hide();
      })();
    } catch (e) {
      console.error(e);
    }
  }, []);

  return loader;
};
