import { ButtonGroup, View, Text } from "./ReactNativeComponents";
import * as React from "react";
import ItemList from "./ItemList";

const colors = [
  {
    "name": "Muted Blue Gray",
    "hex": "#2C2F33",
    "mode": "dark"
  },
  {
    "name": "Light Gray",
    "hex": "#D3D3D3",
    "mode": "light"
  },
  {
    "name": "Warm Dark Brown",
    "hex": "#2D1B14",
    "mode": "dark"
  },
  {
    "name": "Soft Beige",
    "hex": "#F5F5DC",
    "mode": "light"
  },
  {
    "name": "Pale Yellow",
    "hex": "#FAFAD2",
    "mode": "light"
  },
  {
    "name": "Soft Dark Olive",
    "hex": "#3B3C36",
    "mode": "dark"
  },
  {
    "name": "Warm White",
    "hex": "#FFF8E7",
    "mode": "light"
  },
  {
    "name": "Deep Gray",
    "hex": "#1E1E1E",
    "mode": "dark"
  },
  {
    "name": "Muted Green",
    "hex": "#D8E8D8",
    "mode": "light"
  },
  {
    "name": "Dark Charcoal",
    "hex": "#121212",
    "mode": "dark"
  }
]


const ColorNames = colors.map(x => x.name);

const ColorSelection = ({ selectedValue, onChange }: { onChange: (color: string) => void, selectedValue: string }) => {
  const state = buildState({
    viewSize: {
      width: 0,
      height: 0
    },
  }).build();
  const getColorByValue = (color: string) => {
    const c = colors.find(x => x.name == color || x.hex == color);
    if (c)
      return c.hex;
    return colors[0].hex;
  }

  const getColorIndexByValue = (color: string) => {
    const c = colors.findIndex(x => x.hex == color);
    if (c !== -1)
      return c;
    return undefined
  }
  const numColumns = Math.floor(state.viewSize.width / 120);
  return (
    <View css="wi-100% he-100% bac-transparent juc-start ali-flex-start" onLayout={({ nativeEvent }) => {
      state.viewSize = nativeEvent.layout;
    }}>
      {state.viewSize.width > 0 ? (
        <ItemList
          container={({ item }) => {
            return (<View css={`fl-1 bac-white pa-5 juc-center ali-center bac-${(item.hex)} `}>
              <Text css={`co-${methods.invertColor(item.hex)} fos-12 fof-${context.appSettings.fontName}`}>{item.name}</Text>
              <View css="wi-10 he-10 _abc to-2 ri-5 bor-5 bac-red" ifTrue={selectedValue == item.hex}></View>
            </View>) as any
          }}
          items={colors}
          itemCss={(item) => {
            return `co-${methods.invertColor(item.hex)} wi-120 he-50 invert mab-5`;
          }}
          onPress={(item) => {
            onChange(item.hex);
          }}
          vMode={true}
          numColumns={numColumns}
        />) : null}
    </View>
  )
}

export default ColorSelection;