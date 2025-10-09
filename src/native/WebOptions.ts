export default class WebOptions {
    style: any;
    viewStyle: any;
    scrollDisabled: boolean = false;
    scrollValue: number = 0;
    onscroll: string = ""; // dynamic function
    scrollPercentageValue: string = ""; // dynamic function
    onEnd: string = ""; // dynamic function
    onStart: string = ""; // dynamic function
    scrollType: "Pagination" | "PaginationScroll" | "Player" | "Scroll" = "Pagination";
    addNext: boolean = false;
    addPrev: boolean = false;
    prevText: string = "";
    nextText: string = "";
    content: string = ""; // html string
    menu: any;

    addFunction(key: keyof WebOptions, func: string) {
        return this.func(key, this, func) as WebOptions;
    }

    func(key: string, item: Record<string, any>, func: string) {
        item[key] = ("#Func " + func);
        return item;
    }

}