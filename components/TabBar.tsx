import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity
} from "react-native";
import * as Icons from "@expo/vector-icons";
import {
  useState,
  useEffect,
  ReactNode,
  useRef
} from "react";
import {
  sleep,
  newId,
  removeProps
} from "../Methods";
import GlobalData from "../GlobalContext";
import { useUpdate } from "../hooks";
import Text from "./ThemeText";
import { TabIcon, TabChild } from "../Types";

const TabBar = ({
  children,
  selectedIndex,
  style,
  position,
  disableScrolling
}: {
  children: TabChild[];
  style?: any;
  selectedIndex?: number;
  position?: "Bottom" | "Top";
  disableScrolling: boolean;
}) => {
  //GlobalData.hook("theme.settings");
  const update = useUpdate();
  const [size, setSize] = useState(undefined);
  const [rItems, setrItems] = useState([]);
  const [animLeft, setAnimLeft] = useState(
    new Animated.Value(0)
  );
  const [index, setIndex] = useState(
    (0).sureValue(selectedIndex)
  );
  const isAnimating = useRef(false);

  useEffect(() => {
    if (
      !rItems.find(x => x.index == index) &&
      children[index]
    )
      setrItems([
        ...rItems,
        {
          index,
          child: childPrep(children[index])
        }
      ]);
    else animateLeft();
  }, [size, index]);

  useEffect(() => {
    animateLeft();
  }, [rItems]);
  useEffect(
    () => {
      children.forEach((x, i) => {
        if (rItems.find(x => x.index == i)) {
          rItems.find(x => x.index == i).child =
            x;
        }
      });

      update();
    },
    children.map(x => x)
  );
  useEffect(() => {
    setIndex(selectedIndex);
  }, [selectedIndex]);

  const animateLeft = async () => {
    while (isAnimating.current) await sleep(100);
    if (!size || isAnimating.current) return;
    let i = index;
    let left = -(index * size.width);
    if (isNaN(left)) return;
    isAnimating.current = true;
    Animated.timing(animLeft, {
      toValue: left,
      duration: 400,
      useNativeDriver: false
    }).start(() => (isAnimating.current = false));
  };

  const childPrep = child => {
    if (child) {
      if (!child.props.style) return child;
      if (Array.isArray(child.props.style))
        child.props.style.push({ flex: 1 });
      else child.props.style.flex = 1;
    }
    return child;
  };

  const getIcon = (
    icon?: TabIcon,
    iconSize,
    style
  ) => {
    if (!icon) return null;
    let Type = Icons[icon.type];
    if (Type)
      return (
        <Type
          name={icon.name}
          size={(15).sureValue(iconSize)}
          style={removeProps(
            style,
            "backgroundColor"
          )}
        />
      );
  };

  let menu = (
    <View
      style={[
        styles.menu,
        GlobalData.theme.invertSettings()
      ]}>
      {children.map((x, i) => (
        <TouchableOpacity
          style={[
            styles.menuBtn,
            i == (0).sureValue(index)
              ? GlobalData.theme.settings
              : undefined
          ]}
          key={i + "txt"}
          onPress={() => setIndex(i)}>
          {getIcon(
            x.props.icon,
            i == (0).sureValue(index) ? 15 : 18,
            [
              styles.menuText,
              GlobalData.theme.invertSettings(),
              i == (0).sureValue(index)
                ? GlobalData.theme.settings
                : undefined
            ]
          )}
          {!(x.props.title || "").empty() ? (
            <Text
              invertColor={true}
              style={[
                styles.menuText,
                i == (0).sureValue(index)
                  ? GlobalData.theme.settings
                  : undefined
              ]}>
              {x.props.title}
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
  return (
    <View
      style={[
        style,
        {
          flex: 1,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "inherit"
        }
      ]}
      onLayout={event => {
        setSize(event.nativeEvent.layout);
      }}>
      {position === "Top" ? menu : null}
      <Animated.View
        style={[
          styles.container,
          {
            left: animLeft,
            height: (0).sureValue(
              size?.height - styles.menu.height
            ),
            width:
              (size?.width ?? 0) * children.length
          }
        ]}>
        {children.map((x, i) => (
          <ScrollView
            scrollEnabled={!disableScrolling}
            style={{
              width: size?.width
            }}
            contentContainerStyle={{
              flexGrow: 1,
              padding: 5,
              width: size?.width
            }}
            key={i}>
            {rItems.find(x => x.index == i)
              ?.child ?? null}
          </ScrollView>
        ))}
      </Animated.View>
      {position !== "Top" ? menu : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "95%",
    flexDirection: "row",
    display: "flex",
    position: "relative",
    backgroundColor: "transparent"
  },
  menuBtn: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    flex: 1,
    borderRadius: 0
  },
  menuText: {
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  menu: {
    position: "relative",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 40,
    backgroundColor: "transparent"
  }
});

export default TabBar;
