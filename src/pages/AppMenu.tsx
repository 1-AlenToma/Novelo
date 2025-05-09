import Home from "./Home";
import Favorit from "./Favorit";
import Settings from "./Settings";
import Downloaded from "./Downloaded";
import Libraries from "./Libraries";
import { TabBar, View, PlayerView } from "../components";
import * as React from "react";


export default ({ ...props }) => {

  return (
    <TabBar
      lazyLoading={true}
      loadingText="Loading, please wait.."
      footer={<PlayerView isMenu={true} />}
      css="root"
      header={{
        style: "invert",
        textStyle: "invert desc fow-bold",
        selectedTextStyle: "invert desc fow-bold",
        overlayStyle: {
          content: `bac-${context.selectedThemeIndex == 1 ? "#000" : "#CCCCCC"}`
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
