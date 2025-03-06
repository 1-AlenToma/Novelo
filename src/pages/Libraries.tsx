import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Icon,
    NovelGroup,
    AnimatedView,
    ActionSheet,
    AlertDialog,
} from "../components";
import * as React from "react";
import Header from "./Header";
import {
    useNavigation,
    useDbHook,
    useView
} from "../hooks";
import { Book } from "../db";
import { ScrollView, Animated } from "react-native";

const Libraries = ({ ...props }) => {
    const libUrl = "https://github.com/1-AlenToma/Novelo/tree/main/src/parsers";
    const { } = useView({
        component: View,
        loader: {
            text: "loading",
            value: true
        },
        state: {
            parserFiles: [] as Parser[],
        }
    })
}