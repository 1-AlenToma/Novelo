import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View
} from "react-native";
import { Book } from "./db/index";
import "./Global.d";
import ParserTester from "./components/ParserTester";
import Parser from "./parsers/ReadNovelFull";
import useLoader from "./components/Loader";

export default function App() {
  const loader = useLoader(true);
  
  if (loader.loading) return loader.elem;
  return (
    <View style={styles.container}>
      <ParserTester parser={Parser} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
