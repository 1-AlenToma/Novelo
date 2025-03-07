import Home from "./Home";
import Favorit from "./Favorit";
import Settings from "./Settings";
import Downloaded from "./Downloaded";
import Libraries from "./Libraries";
import { TabBar, View } from "../components";
import * as React from "react";

export default ({ ...props }) => {
  context.hook("parser.current");
  return (
    <TabBar
      css="root"
      header={{
        style: "invert",
        textStyle: "invert",
        overlayStyle: {
          content: context.selectedThemeIndex == 1 ? "bac-#000" : "bac-#CCCCCC"
        }
      }}>

      <Home
        title="home"
        disableScrolling={true}
        {...props}
        icon={{
          name: "home",
          type: "Entypo",
          css: "invert"
        }}

      />

      <Favorit
        {...props}
        disableScrolling={true}
        icon={{
          name: "favorite",
          type: "MaterialIcons",
          css: "invert"
        }}
        title="Favorit"
      />

      <Downloaded
        {...props}
        disableScrolling={true}
        icon={{
          name: "download-for-offline",
          type: "MaterialIcons",
          css: "invert"
        }}
        title="Downloads"
      />

      <Libraries
        {...props}
        disableScrolling={true}
        icon={{
          name: "extension",
          type: "MaterialIcons",
          css: "invert"
        }}
        title="Sources"
      />
      <Settings
        {...props}
        icon={{
          name: "settings",
          type: "Ionicons",
          css: "invert"
        }}
        title="Settings"
      />
    </TabBar>
  );
};
