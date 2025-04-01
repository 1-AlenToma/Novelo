import { TouchableOpacityProps, TextInputProps, TextProps, ColorValue, OpaqueColorValue, ImageStyle, View, ViewProps, ActivityIndicatorProps, ScrollViewProps } from "react-native";
import * as ReactNative from "react-native"
import { CSSStyle } from "./styles/CSSStyle"
import * as React from "react";


type TextCustomInputProps = StyledProps & TextInputProps & {
    mode: "Outlined" | "Flat" | "Normal"
}

type ViewStyle = ReactNative.StyleProp<ReactNative.ViewStyle>;

type TextStyle = ReactNative.StyleProp<ReactNative.TextStyle>;

export type ICSS = {
    props: string[]; // .button etc
}

type InternalStyledProps = StyledProps & {
    View: any;
    viewPath: string;
    fullParentPath?: string;
    classNames?: string[];
}

export type MouseProps = {
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: any) => void;
}

export type CSS_String = string | ((css: CSSStyle) => CSSStyle);


export type GenericCSS<A, B = CSS_String, C = {}, D = {}, E = {}> = A | B | C | D | E;

export type StyledProps = {
    css?: CSS_String;
    ifTrue?: ((() => boolean) | boolean);
    style?: ViewStyle;
};

type IConType = "AntDesign" | "Entypo" | "EvilIcons" | "Feather" | "FontAwesome" | "FontAwesome5" | "FontAwesome6" | "Fontisto" | "Foundation" | "Ionicons" | "MaterialCommunityIcons" | "MaterialIcons" | "Octicons" | "SimpleLineIcons" | "Zocial";
export type IConProps = StyledProps & {
    name: string,
    type: IConType;
    color?: string | OpaqueColorValue;
    size?: number;
    borderRadius?: number;
    flash?: ColorValue;
    /**
     * Styles applied to the icon only
     * Good for setting margins or a different color.
     *
     * @default {marginRight: 10}
     */
    iconStyle?: TextStyle;

    /**
     * Style prop inherited from TextProps and TouchableWithoutFeedbackProperties
     * Only exist here so we can have ViewStyle or TextStyle
     *
     */
    style?: ViewStyle | TextStyle;
    /**
     * Background color of the button. Can be a string or OpaqueColorValue (returned from
     * PlatformColor(..))
     *
     * @default '#007AFF'
     */
    backgroundColor?: string | OpaqueColorValue;
}

export type ButtonProps = {
    text?: string;
    icon?: React.ReactNode;
    textCss?: CSS_String;
    disabled?: ((() => boolean) | boolean);
    whilePressed?: () => void;
    whilePressedDelay?: number;
} & StyledProps & Omit<TouchableOpacityProps, "children"> & MouseProps;

type Referer = {
    id: string;
    func: <T extends object>(props: T) => T;
}

export type IThemeContext = {
    /** selectedThemeIndex */
    selectedIndex: number;
    /** All themes eg black, light themes, it is a list of NestedStyleSheets */
    themes: { [key: string]: number }[],
    /**
     * This will always be loaded and its style could also be overridden by selected theme
     */
    defaultTheme: { [key: string]: number };
    /**
     * referer refernce to a function in the ThemeContainer.provider to handle parsing/changing props
     * this could be refer from NestedStyleSheet style in x=> x.props({refererId:${the id}})
     */
    referers?: Referer[];
    /** Save the parsed css to a storage so as to make it faster at parsing.
     * This is not needed on android and ios so use it only for web as it cant be saved locally
     * when the web refreshed
     * use it only if you see that the parsing is to slow.
     * Normally not needed, Added it just incase
     */
    storage?: Storage;
}

export type InternalThemeContext = {
    add: (id: string, element: React.ReactNode, isStattic?: boolean) => void;
    remove: (id: string) => void;
    totalItems: () => number;
    onItemsChange?: () => void;
    onStaticItemsChange?: () => void;
    items: () => { items: Map<any, any>, staticItems: Map<any, any> },
    containerSize: () => Size
}

export type Size = {
    height: number;
    width: number;
    fontScale?: number;
    scale?: number;
    y?: number;
    x?: number;
    px?: number;
    py?: number;
}

export type EventListener = {
    remove: () => void;
}

export type CssSize = "xs" | "sm" | "full";

export type GlobalState = {
    activePan: boolean;
    panEnabled: boolean,
    screen: Size;
    window: Size;
    containerSize: Size;
    storage: CSSStorage;
    tStorage: CSSStorage;
    appStart: () => EventListener[];
    alertViewData: {
        alert: (props: AlertViewProps | string) => void;
        confirm: (props: AlertViewProps | string) => Promise<boolean>;
        toast: (props: ToastProps | string) => void;
        data?: AlertViewFullProps;
        toastData?: ToastProps;
    }
}

type Percentage = `${number}%` | number;
export type AnimationStyle = "Scale" | "Opacity";

export type ModalProps = {
    isVisible: boolean;
    onHide: () => void;
    disableBlurClick?: boolean;
    addCloser?: boolean;
    children: React.ReactNode | React.ReactNode[];
    style?: ViewStyle;
    css?: CSS_String;
    speed?: number;
    animationStyle?: AnimationStyle;
}

export type ActionSheetProps = Omit<ModalProps, "animationStyle"> & {
    size: Percentage | "content";
    lazyLoading?: boolean;
    position?: "Bottom" | "Top" | "Left" | "Right";
}


export type AlertViewAlertProps = {
    message: string;
    size?: CssSize;
    title?: string;
    okText?: string;
    css?: CSS_String
}

export type ToastProps = Omit<AlertViewAlertProps, "okText"> & {
    icon?: React.ReactNode,
    loader?: boolean;
    // default is .01
    loaderCounter?: number;
    loaderBg?: ColorValue;
    type?: "Warning" | "Error" | "Info" | "Success"
    position?: "Top" | "Bottom"
}

export type AlertViewProps = AlertViewAlertProps & {
    yesText?: string;
    cancelText?: string;
}


export type AlertViewFullProps = AlertViewProps & {
    callBack?: (answer: boolean) => void;
}


export type CheckBoxProps = StyledProps & {
    onChange?: (isChecked: boolean) => void;
    onPress?: () => void;
    label?: string;
    checked: boolean;
    disabled?: boolean;
    selectionType?: "CheckBox" | "Radio";
    checkBoxType?: "CheckBox" | "RadioButton" | "Switch";
    swtichColor?: { false: ColorValue, true: ColorValue }
    labelPostion?: "Right" | "Left"

}

export type ICheckBox<T> = React.ReactElement<T>
export type CheckBoxListChild = ICheckBox<Omit<CheckBoxProps, "selectionType" | "checkBoxType" | "onChange">>;

export type CheckBoxListProps = {
    onChange: (checkBoxes: { checked: boolean, checkBoxIndex: number }[]) => void;
    label?: string;
    children: CheckBoxListChild | CheckBoxListChild[]
} & Omit<CheckBoxProps, "checked" | "onChange">

export type MenuIcon = {
    component: any;
    props?: any;
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type ProgressBarProps = StyledProps & {
    value: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1 | (number & {});
    color?: ColorValue;
    text?: string;
    speed?: number;
    children?: React.ReactNode;
}

export type MenuChildren = React.ReactNode & {
    props: TabItemProps;
}

export type TabItemProps = StyledProps & {
    icon?: MenuIcon | IConProps;
    title?: string;
    children: React.ReactNode | React.ReactNode[];
    onLoad?: () => void;
    head?: React.ReactNode;
    disableScrolling?: boolean;
}


export type TabBarProps = StyledProps & {
    children: MenuChildren | MenuChildren[];
    lazyLoading?: boolean;
    loadingText?: string | React.ReactNode;
    selectedTabIndex?: number;
    position?: "Top" | "Bottom";
    onTabChange?: (index: number) => void;
    disableScrolling?: boolean;
    footer?: React.ReactNode;
    header?: {
        style?: GenericCSS<ViewStyle, CSS_String>;
        textStyle?: GenericCSS<TextStyle, CSS_String>;
        selectedStyle?: GenericCSS<ViewStyle, CSS_String>;
        selectedTextStyle?: GenericCSS<TextStyle, CSS_String>;
        selectedIconStyle?: GenericCSS<ViewStyle, CSS_String, ImageStyle, TextStyle, ImageStyle>;
        overlayStyle?: {
            container?: GenericCSS<ViewStyle, CSS_String>;
            content?: GenericCSS<ViewStyle, CSS_String>;
        }
    }
}

export type FabProps = StyledProps & {
    position: "LeftTop" | "RightTop" | "LeftBottom" | "RightBottom";
    follow: "Window" | "Parent",
    onVisible?: () => void;
    blureScreen?: boolean;
    onPress?: (index: number) => void;
    prefix: string | React.ReactNode;
    prefixContainerStyle?: CSS_String | ViewStyle;
    children: React.ReactNode | React.ReactNode[];
}

export type DropdownItem = {
    label: string;
    value: any;
}

export type DropdownRefItem = {
    open: () => void;
    close: () => void;
    selectedValue?: void;
}

export type DropdownListProps = StyledProps & {
    items: DropdownItem[],
    render?: (item: DropdownItem) => React.ReactNode;
    onSelect?: (item: DropdownItem) => void;
    selectedValue?: any;
    mode?: "Modal" | "ActionSheet" | "Fold",
    placeHolder?: string;
    selectedItemCss?: string;
    size?: Percentage;
    enableSearch?: boolean;
    textInputPlaceHolder?: string;
    onSearch?: (items: DropdownItem, txt: string) => boolean;
}

export type CollabseProps = StyledProps & {
    defaultActive?: boolean;
    text?: string | React.ReactNode;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export type LoaderRef = {
    loading: (value: boolean) => void;
}

export type LoaderProps = Omit<ActivityIndicatorProps, "animating" | "hidesWhenStopped"> & {
    loading: boolean;
    text?: string | React.ReactNode;
    children?: React.ReactNode | React.ReactNode[];
}

export type PortalProps = StyledProps & {
    children: React.ReactNode | React.ReactNode[];
}

export type ButtonGroupProps = StyledProps & {
    buttons: string[],
    render?: (button: string, index: number) => React.ReactNode;
    selectMultiple?: boolean;
    selectedIndex: number[];
    onPress?: (index: number[], selectedItems: any[]) => void;
    selectedStyle?: string | ViewStyle;
    itemStyle?: (item: string, index: number) => {
        text?: string | ViewStyle;
        container?: string | ViewStyle;
    }
    isVertical?: boolean;
    scrollable?: boolean;
}

export type ToolTipRef = {
    visible: (value: boolean) => void;
}

export type ToolTipProps = StyledProps & {
    text: string | React.ReactNode;
    children: React.ReactNode;
    containerStyle?: ViewStyle | string;
    postion?: "Top" | "Bottom";
}

export type FormItemProps = StyledProps & {
    children?: React.ReactNode | React.ReactNode[];
    title?: string | React.ReactNode;
    labelPosition?: "Left" | "Top",
    icon?: IConProps | React.ReactNode;
    info?: string;
    message?: React.ReactNode;
}

export type FormGroupProps = StyledProps & {
    title?: string | React.ReactNode;
    formStyle?: "Normal" | "Headless",
    labelPosition?: "Left" | "Top",
}

export type GenericViewProps<T, P> = P & StyledProps & MouseProps & { ref?: React.Ref<T> }
export type GenericView<T, P> = Omit<T, "props" | "ref"> & {
    props: GenericViewProps<T, P>
};

export type PageRef = {
    readonly selectItem: (itemIndex: number) => void;
    readonly totalPages: number;
    readonly refresh: () => void;
}

export type PagerProps = StyledProps & {
    render: (item: any, index: number, selectedCss: string) => React.ReactNode;
    items: any[];
    selectedIndex?: number;
    scrollEnabled?: boolean;
    onChange?: (page: number, totalPages: number) => void;
    onSelect?: (item: any, index: number) => void;
    onEndReached?: () => void;
    horizontal?: boolean;
    renderHeader?: boolean;
    selectedStyle?: CSS_String;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    onEndReachedThreshold?: number;
}

export type BlurProps = StyledProps & TouchableOpacityProps;

export type CSSStorage = {
    delete: (key: string) => void;
    get: (key: string) => any;
    set: (key: string, item: any) => void;
    has: (key: string) => boolean;
    /** Clear All keys that start with CSSStyled_ */
    clear: () => void;
}

type ScrollMenuProps = StyledProps & {
    children: React.ReactElement<StyledProps>[];
    horizontal?: boolean;
    selectedIndex?: number;
    onChange?: (index: number) => void;
    scrollViewProps?: Omit<ScrollViewProps, "style" | "contentContainerStyle" | "horizontal">;
}
