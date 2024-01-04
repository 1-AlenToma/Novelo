import Home from "./Home";
import Favorit from "./Favorit";
import Settings from "./Settings";
import Header from "./Header";
import { TabBar, View } from "../components";
import { useState } from "react";
export default ({ ...props }) => {
  return (
      <TabBar rootView={true}>
        <Home
          head={
            <Header
              {...props}
              inputEnabled={true}
            />
          }
          {...props}
          icon={{
            name: "home",
            type: "Entypo"
          }}
          title="home"
        />

        <Favorit
          {...props}
          icon={{
            name: "favorite",
            type: "MaterialIcons"
          }}
          title="favorit"
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
