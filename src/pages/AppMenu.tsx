import Home from "./Home";
import Favorit from "./Favorit";
import Settings from "./Settings";
import Downloaded from "./Downloaded";
import Header from "./Header";
import { TabBar, View } from "../components";
import * as React from "react";

export default ({ ...props }) => {
  context.hook("parser.current");
  return (
    <TabBar
      rootView={true}
      fontSize={12}>
      <Home
         title="home"
        disableScrolling={true}
        {...props}
        icon={{
          name: "home",
          type: "Entypo"
        }}
       
      />

      <Favorit
        {...props}
        disableScrolling={true}
        icon={{
          name: "favorite",
          type: "MaterialIcons"
        }}
        title="Favorit"
      />
      <Downloaded
        {...props}
        disableScrolling={true}
        icon={{
          name: "download-for-offline",
          type: "MaterialIcons"
        }}
        title="Downloads"
      />
      <Settings
        {...props}
        icon={{
          name: "settings",
          type: "Ionicons"
        }}
        title="Settings"
      />
    </TabBar>
  );
};
