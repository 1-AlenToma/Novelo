import { registerRootComponent } from "expo";
import "./Global"
import App from "./App";
import AppTest from "./App.test";

let testing = false;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(testing ? AppTest : App);
