import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView
} from "react-native";
import { Parser } from "../native";
import useLoader from "./Loader";
import { SearchDetail } from "../native";
import { sleep } from "../Methods";

export default ({
  parser
}: {
  parser: Parser;
}) => {
  const [p] = useState({} as Parser);
  const loader = useLoader(true);
  const [logs, setLogs] = useState([]);
  const lastItems = useRef({});
  let serilize = (item: any) => {
    let items = [];
    if (!item) return [];
    try {
      if (
        Array.isArray(item) &&
        typeof item === "object"
      ) {
        for (let i of item)
          items = [...items, ...serilize(i)];
      } else if (typeof item === "object") {
        for (let i of Object.keys(item)) {
          let v = item[i];
          if (v === undefined || v === null)
            continue;
          if (typeof v === "object") {
            items = [
              ...items,
              i + ":-",
              ...serilize(v)
            ];
          } else {
            items.push(`${i}:"${v}"`);
          }
        }
      } else {
        items.push(`"${item}"`);
      }
    } catch (e) {
      console.error(e);
    }
    return items;
  };
  const tryfn = async (
    id: string,
    fn: Function
  ) => {
    let item = {
      id,
      text: "testing-",
      items: []
    };
    try {
      let v = await fn();
      if (!v) {
        item.text += "value is null";
      } else {
        lastItems.current = v;
        item.items = serilize(v);
      }
    } catch (e) {
      item.text += "failed " + e;
    }

    setLogs(x => [...x, item]);
    await sleep(1000);
  };
  useEffect(() => {
    (async () => {
      /* await tryfn(
        "load",
        async () => await p.load()
      );*/

      await tryfn(
        "search",
        async () =>
          await p.search(
            SearchDetail.n().Text("g")
          )
      );

      await tryfn(
        "detail",
        async () =>
          await p.detail(lastItems.current[0].url)
      );
      
      await tryfn(
        "chapter",
        async () =>
          await p.chapter(lastItems.current.chapters[0].url)
      );
    })();
  }, []);

  useEffect(() => {
    //console.info(logs);
  }, [logs]);

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%" }}>
        <View style={{ flex: 1 }}>
          {logs.map((x, i) => (
            <View
              style={{
                width: "100%"
              }}
              key={i + "pr"}
            >
              <View style={styles.textContainer}>
                <Text style={styles.txt}>
                  {x.id}
                </Text>
                <Text style={styles.txt}>
                  {x.text}
                </Text>
              </View>
              {x.items.map((f, index) => (
                <Text
                  key={index + x.id}
                  style={[
                    styles.txt,
                    {
                      backgroundColor: f.has(":-")
                        ? "#ccc"
                        : null
                    }
                  ]}
                >
                  {f}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1E17",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    paddingTop: 30
  },
  textContainer: {
    flexDirection: "row",
    width: "90%",
    backgroundColor: "red"
  },
  txt: {
    fontSize: 12,
    color: "#ffffff",
    padding: 10,
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    textAlign: "left"
  }
});
