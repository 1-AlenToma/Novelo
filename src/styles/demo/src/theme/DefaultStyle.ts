import { Platform } from "react-native";
import NestedStyleSheet from "../styles/NestedStyleSheet";

const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  error: '#dc3545',
  light: '#f8f9fa',
  dark: '#343a40',

  gray100: '#f7fafc',
  gray200: '#edf2f7',
  gray300: '#e2e8f0',
  gray400: '#cbd5e0',
  gray500: '#a0aec0',
  gray600: '#718096',
  gray700: '#4a5568',
  gray800: '#2d3748',
  gray900: '#1a202c',

  red100: '#fff5f5',
  red200: '#fed7d7',
  red300: '#feb2b2',
  red400: '#fc8181',
  red500: '#f56565',
  red600: '#e53e3e',
  red700: '#c53030',
  red800: '#9b2c2c',
  red900: '#742a2a',

  orange100: '#fffaf0',
  orange200: '#feebc8',
  orange300: '#fbd38d',
  orange400: '#f6ad55',
  orange500: '#ed8936',
  orange600: '#dd6b20',
  orange700: '#c05621',
  orange800: '#9c4221',
  orange900: '#7b341e',

  yellow100: '#fffff0',
  yellow200: '#fefcbf',
  yellow300: '#faf089',
  yellow400: '#f6e05e',
  yellow500: '#ecc94b',
  yellow600: '#d69e2e',
  yellow700: '#b7791f',
  yellow800: '#975a16',
  yellow900: '#744210',

  green100: '#f0fff4',
  green200: '#c6f6d5',
  green300: '#9ae6b4',
  green400: '#68d391',
  green500: '#48bb78',
  green600: '#38a169',
  green700: '#2f855a',
  green800: '#276749',
  green900: '#22543d',

  teal100: '#e6fffa',
  teal200: '#b2f5ea',
  teal300: '#81e6d9',
  teal400: '#4fd1c5',
  teal500: '#38b2ac',
  teal600: '#319795',
  teal700: '#2c7a7b',
  teal800: '#285e61',
  teal900: '#234e52',

  blue100: '#ebf8ff',
  blue200: '#bee3f8',
  blue300: '#90cdf4',
  blue400: '#63b3ed',
  blue500: '#4299e1',
  blue600: '#3182ce',
  blue700: '#2b6cb0',
  blue800: '#2c5282',
  blue900: '#2a4365',

  indigo100: '#ebf4ff',
  indigo200: '#c3dafe',
  indigo300: '#a3bffa',
  indigo400: '#7f9cf5',
  indigo500: '#667eea',
  indigo600: '#5a67d8',
  indigo700: '#4c51bf',
  indigo800: '#434190',
  indigo900: '#3c366b',

  purple100: '#faf5ff',
  purple200: '#e9d8fd',
  purple300: '#d6bcfa',
  purple400: '#b794f4',
  purple500: '#9f7aea',
  purple600: '#805ad5',
  purple700: '#6b46c1',
  purple800: '#553c9a',
  purple900: '#44337a',

  pink100: '#fff5f7',
  pink200: '#fed7e2',
  pink300: '#fbb6ce',
  pink400: '#f687b3',
  pink500: '#ed64a6',
  pink600: '#d53f8c',
  pink700: '#b83280',
  pink800: '#97266d',
  pink900: '#702459',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'rgba(0,0,0,0)',
}

const convertShadow = (item: any) => {
  /*shadowColor: undefined,
  shadowOffset: undefined,
  shadowOpacity: undefined,
  shadowRadius: undefined,
  elevation: undefined*/
  if (Platform.OS == "web") {
    if (item.shadowColor === undefined)
      return {
        boxShadow: "none"
      }
    return {
      elevation: item.elevation,
      boxShadow: `${item.shadowOffset.width}px ${item.shadowOffset.height}px ${item.shadowRadius}px ${item.shadowColor}`
    }
  }

  return item;
}

export const defaultTheme = {
  name: 'default',
  color: colors,

  zIndex: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 10,
    '3xl': 20,
    '4xl': 30,
    '5xl': 40,
    '6xl': 50,
  },

  fontSize: {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 15,
    xl: 17,
    '2xl': 19,
    '3xl': 21,
    '4xl': 24,
    '5xl': 27,
    '6xl': 32,
  },



  shadow: {
    none: convertShadow({
      shadowColor: undefined,
      shadowOffset: undefined,
      shadowOpacity: undefined,
      shadowRadius: undefined,
      elevation: undefined
    }),
    xs: convertShadow({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,

      elevation: 1,
    }),
    sm: convertShadow({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,

      elevation: 4,
    }),
    md: convertShadow({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,

      elevation: 8,
    }),
    lg: convertShadow({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,

      elevation: 12,
    }),
    xl: convertShadow({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,

      elevation: 16,
    }),
    '2xl': convertShadow({
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.51,
      shadowRadius: 13.16,

      elevation: 20,
    }),
  },

  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    circle: 99999,
  },

  spacing: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 24,
    '2xl': 32,
    '3xl': 64,
    '-xs': -4,
    '-sm': -6,
    '-md': -8,
    '-lg': -12,
    '-xl': -24,
    '-2xl': -32,
    '-3xl': -64,
  },
};

export const ComponentsStyles = NestedStyleSheet.create({
  _blur: x => x.cls("_topPostion").fl(1).cls("_center").baC("$co-black").op(.5),
  _topPostion: x => x.po("absolute").to(0).le(0).fillView().baC("$co-transparent").zI("$zi-sm"),
  _modalDefaultStyle: x => x.pa(10).zI(2).wi("80%").he("20%").boR(5).boW(1).boC("gray"),
  _abc: x => x.po("absolute"),
  _overflow: x => x.ov("hidden"),
  _checkBox: x => x.flD("row").di("flex").cls("_center"),
  _center: x => x.juC("center").alI("center"),
  _checkBox$View: x => x.size(24, 24).di("flex").cls("_overflow").boR(5).boW(.5).boC("gray").cls("_center"),
  _checkBox_Right: "mar:5",
  _checkBox_Left: "mal:5",
  _checkBox_checked: "bac:rgb(70 70 70)",
  _actionSheet: x => x.zI(2).to(0).cls("_abc").le(".5%").juC("flex-start").ov("hidden").boC("#CCCCCC"),
  _actionSheet_Bottom: x => x.wi("99%").maH("80%").boTW(.5).boTLR(15).boTRR(15),
  _actionSheet_Top: x => x.maH("80%").wi("99%").boBW(.5).boBLR(15).boBRR(15),
  _actionSheet_Left: x => x.maH("99%").maW("80%").to(".5%").le(0).boTW(.5).boBW(.5).boTRR(15).boBRR(15),
  _actionSheet_Right: "mah:99% maw:80% to:.5% le:0 ri:0 botw-.5 boblR:15 botlr:15",
  _actionSheet_vertical_handle: "mah:10 zi:1 flg:1 _overflow",
  _actionSheet_horizontal_handle: "he:100% wi:10 _overflow",
  _actionSheet_vertical_handle_Button: "_center bor:5 zi:1 to:0 wi:40 he:10 bac:gray _overflow _abc le:45%",
  _actionSheet_horizontal_handle_Button: "_center _abc bor:5 to:50% ri:0 he:40 wi:10 bac:gray",
  _menuItem: x => x.classNames("_center").fl(1).he(40),
  _menuItemText: x => x.tt("uppercase").alS("center"),
  _tabBarContainer: "wi:100% he:100% fl:1 fld:row po:relative bac:transparent",
  _tabBarContainerView: "po:relative miw:100% fld:row juc:space-between ali:center mah:40 he:40 fl:0 flg:1 bac:transparent",
  _tabBar: "wi:100% he:100% fl:1 _overflow",
  _progressBar: "fl:1 wi:100% he:20 zi:5 juc:center _overflow ali:center bor:5 bow:0 boc:#000 bac:transparent",
  _progressBarAnimatedView: x => x.zI(2).cls("_abc").to(0).le("-100%").fillView().op(.8),
  _selectedValue: x => x.baC("#007fff").co("#FFFFFF"),
})