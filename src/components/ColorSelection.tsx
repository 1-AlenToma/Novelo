import { VirtualScroller, DropdownList, View, Text } from "./ReactNativeComponents";
import * as React from "react";
import { useNumColumns } from "hooks";
import { ReadyView } from "./ReadyView";

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




const ColorSelection = ({ selectedValue, onChange }: { onChange: (color: string) => void, selectedValue: string }) => {
  const settings = useNumColumns();


  return (
    <ReadyView >
      <VirtualScroller
        updateOn={[selectedValue]}
        style={{ width: "100%", flexGrow: 1, maxWidth: "95%" }}
        renderItem={({ item }) => {
          return (<View css={`fl-1 bac-white pa-5 juc-center ali-center bac-${(item.hex)} `}>
            <Text css={`co-${methods.invertColor(item.hex)} fos-12 fof-${context.appSettings.fontName}`}>{item.name}</Text>
            <View css="wi-10 he-10 _abc to-2 ri-5 bor-5 bac-red" ifTrue={selectedValue == item.hex}></View>
          </View>) as any
        }}
        items={colors}
        itemSize={{ size: 50 }}
        itemStyle={{ width: settings.width - 10, marginRight: 5, marginBottom: 5 }}
        onItemPress={({ item }) => {
          onChange(item.hex);
        }}
        numColumns={settings.numColumns}
        horizontal={false}
      />
    </ReadyView>
  )
}

export default ColorSelection;