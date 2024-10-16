import cssTranslator, {
  clearStyles,
  serilizeCssStyle
} from "./cssTranslator";
import NestedStyleSheet from "./NestedStyleSheet";
import * as allowedKeys from "./ValidViewStylesAttributes";
import * as React from "react";
import * as reactNative from "react-native";
import { newId } from "../Methods";
let toArray = (item: any) => {
  if (!item) return [];
  if (Array.isArray(item)) return item;
  return [item];
};
class CSS {
  css: string;
  constructor(css?: string) {
    this.css = ` ${(css || "").trim()} `;
  }

  add(...keys: string[]) {
    for (let k of keys) {
      if (
        k.trim().endsWith(".") ||
        k.trim().length == 0
      )
        continue;
      if (this.css.indexOf(` ${k} `) === -1)
        this.css += `${k.trim()} `;
    }
    return this;
  }

  get classes() {
    let items: any[] = [];
    for (let s of this.css
      .split(" ")
      .filter(x => x.trim().length > 0)) {
      if (
        s.indexOf(":") === -1 &&
        s.indexOf("$") === -1 &&
        !items.find(x => x == s)
      ) {
        items.push(s);
      }
    }
    return items;
  }

  distinct() {
    let items = new CSS("").add(
      ...this.css.split(" ")
    );
    return items.css;
  }

  toString() {
    return this.distinct();
  }
}
let CSSContext = React.createContext({});

let StyledWrapper = React.forwardRef(
  (
    {
      View,
      styleFile,
      StyledXName,
      style,
      css,
      ...props
    }: {
      View: any,
      styleFile: any,
      StyledXName: string,
      style?: any,
      css?: any,
    },
    ref
  ) => {
    let ec = React.useContext<any>(CSSContext);
    let id = React.useRef(newId()).current;
    let [_, setUpdater] = React.useState(0);
    let parsedData: any = React.useRef({
      oldCss: undefined,
      style: undefined,
      pk: undefined
    }).current;
    const validKeyStyle = View.displayName
      ? allowedKeys[View.displayName]
      : undefined;

    React.useEffect(() => {
     // if (parsedData.oldCss == css)
     //     return;
      parsedData.style = undefined;
      setUpdater(x => (x > 1000 ? 1 : x) + 1);
    }, [css]);

    React.useEffect(() => {
      return () => clearStyles(id);
    }, []);

    if (
      styleFile &&
      parsedData.style == undefined
    ) {
      let sArray: any[] = [];
      let pk = "";
      let cpyCss = new CSS(css);
      pk = ec.parentKey ? ec.parentKey() : "";
      if (pk.length > 0 && !pk.endsWith("."))
        pk += ".";
      pk += StyledXName;
      cpyCss.add(StyledXName, pk);
      if (ec.parentClassNames) {
        cpyCss.add(
          ec.parentClassNames(
            StyledXName,
            cpyCss.toString()
          )
        );
        css = cpyCss.toString();
      }
      let tCss = cssTranslator(
        cpyCss.toString(),
        styleFile,
        validKeyStyle,
        id
      );
      if (tCss) sArray.push(tCss);
      parsedData.style = sArray;
      parsedData.pk = pk;
      parsedData.oldCss = css;
    }

    let cValue = {
      parentKey: () => parsedData.pk,
      parentClassNames: (
        StyledXName: string,
        pk: string
      ) => {
        let ss = new CSS(css).add(pk);
        if (!css) return "";
        let c = new CSS();
        for (let s of ss.classes) {
          let m = ` ${s}.${StyledXName}`;
          c.add(m);
        }
        return c.toString();
      }
    };

    return (
      <CSSContext.Provider value={cValue}>
        <View
          {...props}
          ref={ref}
          StyledXName={parsedData.pk}
          style={[
            ...toArray(parsedData.style),
            ...toArray(style)
          ]}
        />
      </CSSContext.Provider>
    );
  }
);

export type Styled = {
  css?: string;
};

const Styleable = function <T>(
  View: T,
  identifier: string,
  styleFile: any
) {
  let fn = React.forwardRef((props, ref) => {
    let pr = {
      View,
      StyledXName: identifier,
      styleFile
    };
    return (
      <StyledWrapper
        {...props}
        {...pr}
        ref={ref}
      />
    );
  });
  return fn as any as T & Styled;
};

export {
  Styleable,
  NestedStyleSheet,
  cssTranslator,
  clearStyles
};
