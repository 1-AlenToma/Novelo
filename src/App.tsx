import "./Global";
import 'react-native-get-random-values'
import RNExitApp from "react-native-exit-app";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import * as React from "react";
import {
    useLoader,
    HtmlGetter,
} from "./components";
import * as NavigationBar from "expo-navigation-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AppStack } from "./pages";
import { useFonts } from "./hooks";
import { AlertDialog, NestedStyleSheet, ThemeContainer, useTimer } from "react-native-short-style";
import AppTest from "./App.test";
import GlobalFileBrowse from "./components/GlobalFileBrowse";
import CStyle from "./components/CStyle";
import { Platform } from "react-native";
import * as icons from '@expo/vector-icons';

let colors = NestedStyleSheet.create({
    lightco: "co-#15181f",
    lightbg: "bac-#ffffff",

    light: "lightco lightbg",

    darkco: "co-#ffffff",
    darkbg: "bac-#15181f",

    dark: "darkco darkbg",
    ActionSheet: "maw-95% le-2.5% bac-transparent !important",
    _sliderThump: "_abc to:-35 le:-15 fos-sm bor:5 fow:bold bow:1 boc:#CCC miw:50 pat:2 pab:2 tea:center zi:100 invert",

    ActionSheet$View$$ViewView: "invert",
    FormItem: "invert",
    FormItem$View$$View$View$$View$View$Text: "invert",
    DropdownList$View$Text$$View$Icon: "invertco",
    DropDownListItems: "invert",
    DropDownListItem: "invert",
    DropdownList$View$Icon: "invertco",
    Modal: "invert !important",

})

const lightTheme = NestedStyleSheet.create({
    ...colors,
    View: "lightbg",
    TouchableOpacity: "lightbg",
    Text: "bac-transparent lightco",
    Icon: "darkco fos-24",
    TextInput: "light pal-5 par-5",
    invert: "invertco invertbac",
    invertco: "darkco",
    invertbac: "darkbg",
    invert$View$$TouchableOpacity: "bac-transparent",
    invert$Text$$Icon: "invertco",
    invert$Icon: "lightco"
});

const darkTheme = NestedStyleSheet.create({
    ...colors,
    View: "darkbg",
    TouchableOpacity: "darkbg",
    Text: "bac-transparent darkco",
    Icon: "lightco fos-24",
    TextInput: "dark pal-5 par-5",
    invert: "invertco invertbac",
    invertco: "lightco",
    invertbac: "lightbg",
    invert$View$$TouchableOpacity: "bac-transparent",
    invert$Text: "invertco",
    invert$Icon: "darkco"
});


const testning = false;

const App = () => {
    const fontLoader = useFonts();
    context.hook("size", "selectedThemeIndex", "isFullScreen", "updater", "files");

    context.useEffect(
        (item, props) => {
            NavigationBar.setVisibilityAsync(

                context.isFullScreen && !context.KeyboardState
                    ? "hidden"
                    : "visible"
            );
            setStatusBarHidden(context.isFullScreen);
            if (!context.isFullScreen) {
                NavigationBar.setBehaviorAsync("overlay-swipe");
            }

        },
        "isFullScreen",
        "KeyboardState"
    );

    const visibility = NavigationBar.useVisibility();
    const loader = useLoader(true);
    useEffect(() => {

        let itemToRemove: any[] = [];
        (async () => {
            try {
                loader.show();
                itemToRemove = await context.init();
                context.isFullScreen = false;
            } catch (e) {
                console.error(e);
            } finally {
                loader.hide();
            }
        })();
        context.isFullScreen = false;
        return () => {
            // Platform.constants?.Model a fix for windows android subsystem as it causing an issue 
            if (!__DEV__ && !((Platform?.constants as any)?.Model?.has("Subsystem for Android") ?? false))
                RNExitApp.exitApp?.();
            itemToRemove?.forEach(x => x.remove());
        };
    }, []);


    return (
        <ThemeContainer
            icons={icons}
            themes={[lightTheme, darkTheme]}
            defaultTheme={CStyle}
            selectedIndex={context.selectedThemeIndex}>
            <HtmlGetter />
            {
                loader.loading ? loader.elem : fontLoader.loading ? fontLoader.elem : (
                    <>
                        <NavigationContainer>
                            <AppStack />
                        </NavigationContainer>
                        <StatusBar style={context.selectedThemeIndex == 0 ? "dark" : "light"} />
                        <GlobalFileBrowse />
                    </>
                )
            }


        </ThemeContainer>
    );
}




export default (testning ? AppTest : App);