import { ViewStyle, TextStyle } from "react-native";

export default class WebOptions {
    style: any;
    viewStyle: any;
    scrollDisabled: boolean;
    scrollValue: number;
    onscroll: string; // dynamic function
    scrollPercentageValue: string; // dynamic function
    onEnd: string; // dynamic function
    onStart: string; // dynamic function
    scrollType: "Pagination" | "PaginationScroll" | "Player" | "Scroll";
    addNext: boolean;
    addPrev: boolean;
    prevText: string;
    nextText: string;
    content: string; // html string
    menu: any;

    addFunction(key: keyof WebOptions, func: string) {
        return this.func(key, this, func) as WebOptions;
    }

    func(key: string, item: Object, func: string) {
        item[key] = ("#Func " + func);
        return item;
    }

}