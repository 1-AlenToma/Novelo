import { ButtonGroup } from "./ReactNativeComponents";
import * as React from "react";


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

  const getColorByValue = (color: string) => {
    const c = colors.find(x => x.name == color || x.hex == color);
    if (c)
      return c.hex;
    return colors[0].hex;
  }

  const getColorIndexByValue = (color: string) => {
    const c = colors.findIndex(x => x.hex == color);
    if (c !== -1)
      return [c];
    return [0];
  }


  return (
    <ButtonGroup
      selectedStyle={"co-red bac-transparent"}
      style={{ justifyContent: "space-around", width: "100%" }}
      itemStyle={(_, index) => {
        return {
          container: { backgroundColor: colors[index].hex },
          text: { color: methods.invertColor(colors[index].hex), backgroundColor: "transparent" },
        }
      }
      }
      scrollable={true}
      buttons={ColorNames}
      onPress={(_, items) => {
        onChange(getColorByValue(items[0]));
      }}
      selectedIndex={getColorIndexByValue(selectedValue)}
    />
  )
}

export default ColorSelection;