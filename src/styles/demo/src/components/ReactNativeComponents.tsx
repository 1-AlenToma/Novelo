import * as React from "react";
import * as Native from "react-native";
import { Styleable } from "../styles";
import { ViewProps, TextProps, ScrollViewProps, TouchableOpacityProps, ImageProps, TextInputProps, Animated, FlatListProps } from "react-native/types";
import { GenericViewProps, GenericView } from "../Typse";
import * as NativeSlider from '@miblanchard/react-native-slider';


const styledItems: any = {}
const AnimatedTouchable = Native.Animated.createAnimatedComponent(Native.TouchableOpacity);
export const CreateView = function <T extends object, P>(view: any, name?: string) {
    name = name ?? view.displayName ?? view;
    let cacheName = view.displayName ?? name;
    let View = styledItems[cacheName] ? styledItems[cacheName] : (styledItems[cacheName] = Styleable(view, name));
    return View as GenericView<T, P> & ((props: GenericViewProps<T, P>) => React.ReactNode);
}

// so we could know that this item was create by react-native-short-style
CreateView.prototype.CssStyleAble = CreateView.CssStyleAble = true;


export const View = CreateView<Native.View, ViewProps>(Native.View);
export const Slider = CreateView<NativeSlider.Slider, NativeSlider.SliderProps>(NativeSlider.Slider, "Slider");
export const SafeAreaView = CreateView<Native.SafeAreaView, ViewProps>(Native.SafeAreaView);
export const Text = CreateView<Native.Text, TextProps>(Native.Text);
export const TextInput = CreateView<Native.TextInput, Native.TextInputProps>(Native.TextInput);
export const ScrollView = CreateView<Native.ScrollView, ScrollViewProps>(Native.ScrollView);
export const FlatList = CreateView<Native.FlatList, FlatListProps<any>>(Native.FlatList, "FlatList");
export const TouchableOpacity = CreateView<Native.TouchableOpacity, TouchableOpacityProps>(Native.TouchableOpacity);
export const TouchableWithoutFeedback = CreateView<Native.TouchableWithoutFeedback, Native.TouchableWithoutFeedbackProps>(Native.TouchableOpacity);
export const TouchableNativeFeedback = CreateView<Native.TouchableNativeFeedback, Native.TouchableNativeFeedbackProps>(Native.TouchableOpacity);
export const Image = CreateView<Native.Image, ImageProps>(Native.Image);
export const AnimatedView = CreateView<Native.View, ViewProps>(Native.Animated.View, "AnimatedView");
export const AnimatedText = CreateView<Native.Text, TextProps>(Native.Animated.Text, "AnimatedText");
export const AnimatedTouchableOpacity = CreateView<Native.TouchableOpacity, TouchableOpacityProps>(AnimatedTouchable, "AnimatedTouchableOpacity");
export const AnimatedScrollView = CreateView<Native.ScrollView, ScrollViewProps>(Native.Animated.ScrollView, "AnimatedScrollView");
