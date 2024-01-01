import {
  TabBar,
  Text,
  View
} from "../components/";
import Home from "./Home";
import Favorit from "./Favorit";
import Settings from "./Settings";
export default () => {
  return (
    <TabBar>
      <Home
        icon={{ name: "home", type: "Entypo" }}
        title="home"
      />
      <Favorit
        icon={{
          name: "favorite",
          type: "MaterialIcons"
        }}
        title="favorit"
      />
      <Settings
        icon={{
          name: "settings",
          type: "Ionicons"
        }}
        title="Settings"
      />
    </TabBar>
  );
};
