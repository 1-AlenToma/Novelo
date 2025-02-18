import { ThemeContext, globalData, InternalThemeContext } from "./ThemeContext";
import * as React from "react";
import { IThemeContext } from "../Typse";
import StateBuilder from "react-smart-state";
import { newId, clearAllCss } from "../config";
import { View, AlertView, ToastView } from "../components";


const StaticItem = ({ onMounted, id, item }: any) => {
    const state = StateBuilder({
        item: item
    }).ignore("item").build();

    onMounted(x => state.item = x);
    return state.item;
}



const StaticFullView = () => {
    const context = React.useContext(InternalThemeContext);
    const state = StateBuilder({
        updater: ""
    }).build();

    context.onItemsChange = () => {
        state.updater = newId();
    }
    const items = [...context.items().items.entries()]


    return (
        <View css={x => x.cls("_topPostion").zI("$zi-lg")} ifTrue={items.length > 0}>
            {
                items.map(([key, value], i) => (
                    <React.Fragment key={key}>
                        {value.el}
                    </React.Fragment>
                ))
            }
        </View>
    )
}

const StaticView = () => {
    const context = React.useContext(InternalThemeContext);
    const state = StateBuilder({
        updater: ""
    }).build();

    context.onStaticItemsChange = () => {
        state.updater = newId();

    }
    const items: any[] = [...context.items().staticItems.entries()]
    return (
        items.map(([key, value], i) => (
            <React.Fragment key={key}>
                {value.el}
            </React.Fragment>
        ))
    )


}

const ThemeInternalContainer = ({ children }: any) => {
    const state = StateBuilder({
        items: new Map<string, { el: any, onchange: Function }>(),
        staticItems: new Map<string, { el: any, onchange: Function }>(),
        containerSize: { height: 0, width: 0, y: 0, x: 0 }
    }).ignore("items", "containerSize", "staticItems").build();

    const contextValue = {
        add: (id: string, element: React.ReactNode, isStattic?: boolean) => {
            let item = !isStattic ? state.items.get(id) : state.staticItems.get(id);
            if (!item) {
                item = { onchange: undefined, el: undefined }
                item.el = (<StaticItem id={id} item={element} onMounted={(fn) => item.onchange = fn} />)
                if (!isStattic)
                    state.items.set(id, item);
                else
                    state.staticItems.set(id, item);

                if (!isStattic)
                    contextValue.onItemsChange?.();
                else
                    contextValue.onStaticItemsChange?.();
            } else item.onchange?.(element);
        },
        remove: (id: string) => {
            let hasItems = state.items.has(id);
            let hasStatic = state.staticItems.has(id);
            if (hasItems)
                state.items.delete(id);
            if (hasStatic)
                state.staticItems.delete(id);

            if (hasItems)
                contextValue.onItemsChange?.();
            if (hasStatic)
                contextValue.onStaticItemsChange?.();
        },
        totalItems: () => state.items.size,
        items: () => {
            return { items: state.items, staticItems: state.staticItems }
        },
        staticItems: () => state.staticItems,
        onItemsChange: () => { },
        onStaticItemsChange: () => { },
        containerSize: () => state.containerSize

    }



    return (
        <InternalThemeContext.Provider value={contextValue}>
            <View onLayout={(event) => {
                event.target.measure(
                    (x, y, width, height, pageX, pageY) => {
                        state.containerSize.height = height;
                        state.containerSize.width = width;
                        state.containerSize.y = y;
                        state.containerSize.x = x;
                        globalData.containerSize = state.containerSize;
                    },
                );
            }} style={{ backgroundColor: "transparent", flex: 1, width: "100%", height: "100%" }}>
                <StaticFullView />
                <StaticView />
                <ToastView />
                <AlertView />
                <View style={{
                    width: "100%",
                    height: "100%",
                    zIndex: 1
                }}>
                    {children}
                </View>
            </View>
        </InternalThemeContext.Provider>
    )
}

export const ThemeContainer = (props: IThemeContext & { children: any }) => {
    globalData.hook("window");
    const state = StateBuilder({
        selectedIndex: props.selectedIndex
    }).build();
    React.useEffect(() => {
        let events = globalData.appStart();
        if (props.storage)
            globalData.storage = props.storage as any;
        return () => events.forEach(x => x.remove());
    }, [])

    React.useEffect(() => {
        if (props.storage)
            globalData.storage = props.storage as any;
    }, [props.storage])

    if (state.selectedIndex != props.selectedIndex) {
        clearAllCss();
        state.selectedIndex = props.selectedIndex;
    }

    return (
        <ThemeContext.Provider value={props}>
            <ThemeInternalContainer>
                {props.children}
            </ThemeInternalContainer>
        </ThemeContext.Provider>
    )

}