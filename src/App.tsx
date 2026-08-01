import 'react-native-get-random-values'
import RNExitApp from "react-native-exit-app";
import "./Global";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import * as React from "react";
import {
    useLoader,
    HtmlGetter,
    StartUp,
} from "./components";
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from "@react-navigation/native";
import { AppStack } from "./pages";
import { useFonts } from "./hooks";

import { NestedStyleSheet, ThemeContainer } from "react-native-short-style";
import GlobalFileBrowse from "./components/GlobalFileBrowse";
import CStyle from "./components/CStyle";
import { Platform, Text } from "react-native";
import * as icons from '@expo/vector-icons';
import { useKeepAwake } from "expo-keep-awake";
let colors = NestedStyleSheet.create({
    lightco: "co-#15181f",
    lightbg: "bac-#ffffff",

    light: "lightco lightbg",

    darkco: "co-#ffffff",
    darkbg: "bac-#15181f",

    dark: "darkco darkbg",
    ActionSheet: "maw-95% le-2.5% bac-transparent!important",
    "ActionSheet>View>View:eq(1)": "mat-20-!important",
    _sliderThump: "_abc to:-35 le:-15 fos-sm bor:5 fow:bold bow:1 boc:#CCC miw:50 pat:2 pab:2 tea:center zi:100 invert",

    "ActionSheet>View, ActionSheet >View >View": "invert",
    FormItem: "invert mah-100",
    "FormItem View, FormItem Text": "invert",
    "DropdownList > View > Text ,DropdownList > View View > Icon": "invertco",
    "DropDownListItems, DropDownListItem": "invert",
    "DropdownList View Icon": "invertco",
    Modal: "invert !important",
    "invert> *": "bac-transparent",
    "invert Text, invert > Icon": "invertco",
    "_toast * TouchableOpacity Icon": "bac-transparent fos-15 co-red !important",
    "collabseItem > TouchableOpacity": "invert"
})

const lightTheme = NestedStyleSheet.create({

    View: "lightbg",
    TouchableOpacity: "lightbg",
    Text: "bac-transparent lightco",
    Icon: "darkco fos-24",
    TextInput: "light pa-0 pal-5 par-5",
    invert: "invertco invertbac",
    invertco: "darkco",
    invertbac: "darkbg",
    "invert> Icon": "lightco",
    ...colors,
});

const darkTheme = NestedStyleSheet.create({

    View: "darkbg",
    TouchableOpacity: "darkbg",
    Text: "bac-transparent darkco",
    Icon: "lightco fos-24",
    TextInput: "dark pa-0 pal-5 par-5",
    invert: "invertco invertbac",
    invertco: "lightco",
    invertbac: "lightbg",
    "invert> Icon": "darkco",
    ...colors,
});


const testning = false;

const App = () => {
    const fontLoader = useFonts();
    context.hook("selectedThemeIndex", "isFullScreen", "updater");

    context.useEffect(
        () => {
            const toggleSystemBars = async () => {
              
                // Toggle the Android System Navigation Bar visibility using the new API
                const shouldHide = context.isFullScreen && !context.KeyboardState;
                NavigationBar.NavigationBar.setHidden(shouldHide);

                // Handle the Status Bar matching the fullscreen flag
                //setStatusBarHidden(context.isFullScreen);

                // Maintain overlay swipe behavior when the layout is restored
                // if (!context.isFullScreen) {
                //   await NavigationBar.setBehaviorAsync("overlay-swipe");
                // }
            };

            toggleSystemBars();

        },
        "isFullScreen",
        "KeyboardState"
    );

    const loader = useLoader(true);
    useEffect(() => {
        let itemToRemove: any[] = [];
        (async () => {
            try {
                loader.show();
                itemToRemove = await context.AppStart();
                context.isFullScreen = false;
            } catch (e) {
                console.error(e);
            } finally {
                loader.hide();
            }
        })();
        context.isFullScreen = false;
        return () => {
            (async () => {

                try {
                    await context.db.rollbackTransaction(); // if there is an open connection
                } catch { }

                try {
                    await context.db.close();
                } catch { }

                itemToRemove?.forEach(x => x.remove());
                // Platform.constants?.Model a fix for windows android subsystem as it causing an issue 
                if (!((Platform?.constants as any)?.Model?.has("Subsystem for Android") ?? false))
                    RNExitApp.exitApp?.();
            })();
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
                    <StartUp>
                        <NavigationContainer>
                            <AppStack />
                        </NavigationContainer>
                        <StatusBar style={context.selectedThemeIndex == 0 ? "dark" : "light"} />
                        <GlobalFileBrowse />
                    </StartUp>
                )
            }


        </ThemeContainer>
    );
}




export default (App);