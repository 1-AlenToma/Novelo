import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { flatStyle } from "../config/CSSMethods";
import { defaultTheme } from "../theme/DefaultStyle";
import { ShortStyles } from "./validStyles";
import { CSS_String, StyledProps } from "../Typse";

type ValueType = ViewStyle & TextStyle & ImageStyle;
type Sizes = 5 | 10 | 20 | 30 | 40 | 60 | 70 | 80 | 90 | 100;
type Colors<K extends string> = `${K}-${keyof typeof defaultTheme.color}` | (string & {})
type FontSizes = `$fos-${keyof typeof defaultTheme.fontSize}` | (ValueType["fontSize"] & {}) | (string & {})
type zIndex = `$zi-${keyof typeof defaultTheme.zIndex}` | (ValueType["zIndex"] & {}) | (string & {})
type BorderRadius = `$bor-${keyof typeof defaultTheme.borderRadius}` | (number & {});
type Spacing = `$sp-${keyof typeof defaultTheme.spacing}` | (ValueType["letterSpacing"] & {});
type SizeValue<K extends string> = `${Sizes}${K}` | number | (string & {});
// referer refernce to a function in the ThemeContainer.przIndexovider to handle parsing/changing props
export type CSSProps<T extends object> = T & StyledProps & { refererId?: string; }



//let test: SizeValue<"%"> | SizeValue<"vh"> | SizeValue<"vw"> = ""

type classNames = (`sh-${keyof typeof defaultTheme.shadow}` | `sp-${keyof typeof defaultTheme.spacing}`) | (string & {})

export abstract class ExtraCssStyle {
    value: string = "";
    type: string = "CSSStyled";



    /** Add classNames  eg container*/
    classNames(...cls: classNames[]) {
        cls.forEach(x => {
            if (x)
                this.value += ` ${x}`;
        });

        return this;
    }

    /** Add classNames  eg container*/
    cls(...cls: classNames[]) {

        cls.forEach(x => {
            if (x)
                this.value += ` ${x}`;
        });

        return this;
    }

    /** Add unknown prop eg color, #FFF */
    add(key: string, value?: any | null) {
        if (value == undefined)
            value = "undefined";
        if (value === null)
            value = "null";

        this.value += ` ${key.trim()}${key.endsWith(":") ? "" : ":"}${value}`;
        return this;
    }
    /** height and width = 100% */
    fillView() {
        return this.size("100%", "100%");
    }

    /** Add with and height of the View */
    size(width: SizeValue<"%"> | SizeValue<"vw">, height?: SizeValue<"%"> | SizeValue<"vh">) {
        this.add(ShortStyles.width, width);
        if (height != undefined)
            this.add(ShortStyles.height, height);

        return this;
    }

    /**
      * 
      * x: 25px 50px 75px 100px;
    -----------------
        top x is 25px
    
        right x is 50px
    
        bottom x is 75px
    
        left x is 100px
    
      * x: 25px 50px 75px;
    -----------------
        top x is 25px
    
        right and left x are 50px
    
        bottom x is 75px
    
      * x: 25px 50px;
    -----------------
        top and bottom x are 25px
    
        right and left x are 50px
      */
    padding(v1: ValueType["padding"], v2?: ValueType["padding"], v3?: ValueType["padding"], v4?: ValueType["padding"]) {
        if (v1 != undefined && v2 == undefined && v3 == undefined && v4 == undefined)
            return this.add(ShortStyles.padding, v1)
        if (v1 != undefined && v2 != undefined && v3 != undefined && v4 != undefined)
            return this.add(ShortStyles.paddingTop, v1).add(ShortStyles.paddingRight, v2).add(ShortStyles.paddingBottom, v3).add(ShortStyles.paddingLeft, v4);
        if (v1 != undefined && v2 != undefined && v3 != undefined)
            return this.add(ShortStyles.paddingTop, v1).add(ShortStyles.paddingRight, v2).add(ShortStyles.paddingBottom, v3).add(ShortStyles.paddingLeft, v2);

        if (v1 != undefined && v2 != undefined)
            return this.add(ShortStyles.paddingTop, v1).add(ShortStyles.paddingRight, v2).add(ShortStyles.paddingBottom, v1).add(ShortStyles.paddingLeft, v2);
        return this;
    }

    /**
   * read https://www.w3schools.com/css/css_padding.asp on how this is used
   */
    pa(v1: ValueType["padding"], v2?: ValueType["padding"], v3?: ValueType["padding"], v4?: ValueType["padding"]) {
        return this.padding(v1, v2, v3, v4);
    }


    /**
      * 
      * x: 25px 50px 75px 100px;
    -----------------
        top x is 25px
    
        right x is 50px
    
        bottom x is 75px
    
        left x is 100px
    
      * x: 25px 50px 75px;
    -----------------
        top x is 25px
    
        right and left x are 50px
    
        bottom x is 75px
    
      * x: 25px 50px;
    -----------------
        top and bottom x are 25px
    
        right and left x are 50px
      */
    margin(v1: ValueType["margin"], v2?: ValueType["margin"], v3?: ValueType["margin"], v4?: ValueType["margin"]) {
        if (v1 != undefined && v2 == undefined && v3 == undefined && v4 == undefined)
            return this.add(ShortStyles.margin, v1)
        if (v1 != undefined && v2 != undefined && v3 != undefined && v4 != undefined)
            return this.add(ShortStyles.marginTop, v1).add(ShortStyles.marginRight, v2).add(ShortStyles.marginBottom, v3).add(ShortStyles.marginLeft, v4);
        if (v1 != undefined && v2 != undefined && v3 != undefined)
            return this.add(ShortStyles.marginTop, v1).add(ShortStyles.marginRight, v2).add(ShortStyles.marginBottom, v3).add(ShortStyles.marginLeft, v2);

        if (v1 != undefined && v2 != undefined)
            return this.add(ShortStyles.marginTop, v1).add(ShortStyles.marginRight, v2).add(ShortStyles.marginBottom, v1).add(ShortStyles.marginLeft, v2);
        return this;
    }

    /**
      * 
      * x: 25px 50px 75px 100px;
    -----------------
        top x is 25px
    
        right x is 50px
    
        bottom x is 75px
    
        left x is 100px
    
      * x: 25px 50px 75px;
    -----------------
        top x is 25px
    
        right and left x are 50px
    
        bottom x is 75px
    
      * x: 25px 50px;
    -----------------
        top and bottom x are 25px
    
        right and left x are 50px
      */
    ma(v1: ValueType["margin"], v2?: ValueType["margin"], v3?: ValueType["margin"], v4?: ValueType["margin"]) {
        return this.margin(v1, v2, v3, v4);
    }


    /**
    * 
    * x: 25px 50px 75px 100px;
  -----------------
      top x is 25px
  
      right x is 50px
  
      bottom x is 75px
  
      left x is 100px
  
    * x: 25px 50px 75px;
  -----------------
      top x is 25px
  
      right and left x are 50px
  
      bottom x is 75px
  
    * x: 25px 50px;
  -----------------
      top and bottom x are 25px
  
      right and left x are 50px
    */
    positions(v1: ValueType["top"], v2: ValueType["top"], v3?: ValueType["top"], v4?: ValueType["top"]) {
        if (v1 != undefined && v2 != undefined && v3 != undefined && v4 != undefined)
            return this.add(ShortStyles.top, v1).add(ShortStyles.right, v2).add(ShortStyles.bottom, v3).add(ShortStyles.left, v4);
        if (v1 != undefined && v2 != undefined && v3 != undefined)
            return this.add(ShortStyles.top, v1).add(ShortStyles.right, v2).add(ShortStyles.bottom, v3).add(ShortStyles.left, v2);

        if (v1 != undefined && v2 != undefined)
            return this.add(ShortStyles.top, v1).add(ShortStyles.right, v2).add(ShortStyles.bottom, v1).add(ShortStyles.left, v2);
        return this;
    }

    /**
    * 
    * x: 25px 50px 75px 100px;
  -----------------
      top x is 25px
  
      right x is 50px
  
      bottom x is 75px
  
      left x is 100px
  
    * x: 25px 50px 75px;
  -----------------
      top x is 25px
  
      right and left x are 50px
  
      bottom x is 75px
  
    * x: 25px 50px;
  -----------------
      top and bottom x are 25px
  
      right and left x are 50px
    */
    pos(v1: ValueType["top"], v2: ValueType["top"], v3?: ValueType["top"], v4?: ValueType["top"]) {
        return this.positions(v1, v2, v3, v4);
    }


    /** Add css value with conditions */
    if(value: boolean | Function | undefined | null, $this: CSS_String, $else?: CSS_String) {
        if (value && typeof value == "function")
            value = value();
        if (value)
            return this.joinRight($this);
        else if ($else)
            return this.joinRight($else)
        return this;
    }

    joinLeft(value: CSSStyle | string | ViewStyle | ImageStyle | TextStyle | ((x: CSSStyle) => CSSStyle)) {
        if (value && typeof value == "function") {
            (value as Function)(this)
            return this;
        }
        if (value && typeof value == "object" && (value as CSSStyle).type == this.type) {
            this.value = `${(value as CSSStyle).value} ${this.value}`;
        } else if (value && typeof value == "object") {
            let css = ""
            let style = flatStyle(value);
            for (let key in style) {
                let v = style[key]
                if (v == undefined)
                    css += ` ${key}:undefined`;
                else if (v === null)
                    css += ` ${key}:null`;
                else if (typeof v === "object") {
                    console.warn("CSSStyle cannot join object, value", v)
                    continue;
                } else
                    css += ` ${key}:${v}`;
            }

            value = css;
        }

        if (value && typeof value == "string") {
            this.value = `${value} ${this.value}`;
        }

        return this;
    }

    joinRight(value: CSSStyle | string | ViewStyle | ImageStyle | TextStyle | ((x: CSSStyle) => CSSStyle)) {
        if (value && typeof value == "function") {
            (value as Function)(this)
            return this;
        }

        if (value && typeof value == "object" && (value as CSSStyle).type == this.type) {
            this.value = `${(value as CSSStyle).value} ${this.value}`;
        } else if (value && typeof value == "object") {
            let css = ""
            let style = flatStyle(value);
            for (let key in style) {
                let v = style[key]
                if (v == undefined)
                    this.add(key, undefined)
                else if (v === null)
                    this.add(key, null);
                else if (typeof v === "object") {
                    console.warn("CSSStyle cannot join object, value", v)
                    continue;
                } else
                    this.add(key, v);
            }
            return this;
        }


        if (value && typeof value == "string") {
            this.value = `${this.value} ${value}`;
        }

        return this;
    }

}

export class CSSStyle extends ExtraCssStyle {

    textTransform(value: ValueType["textTransform"]) {
        return this.add(ShortStyles.textTransform, value);
    }

    tt(value: ValueType["textTransform"]) {
        return this.textTransform(value);
    }

    public toString = (): string => {
        return this.value ?? "";
    }


    alignContent(value?: ValueType["alignContent"] | null) {
        return this.add(ShortStyles.alignContent, value);
    }

    /** Add alignContent */
    alC(value?: ValueType["alignContent"] | null) {
        return this.add(ShortStyles.alignContent, value);
    }

    alignItems(value?: ValueType["alignItems"] | null) {
        return this.add(ShortStyles.alignItems, value);
    }

    /** Add alignItems */
    alI(value?: ValueType["alignItems"] | null) {
        return this.add(ShortStyles.alignItems, value);
    }

    alignSelf(value?: ValueType["alignSelf"] | null) {
        return this.add(ShortStyles.alignSelf, value);
    }

    /** Add alignSelf */
    alS(value?: ValueType["alignSelf"] | null) {
        return this.add(ShortStyles.alignSelf, value);
    }

    aspectRatio(value?: ValueType["aspectRatio"] | null) {
        return this.add(ShortStyles.aspectRatio, value);
    }

    /** Add aspectRatio */
    asR(value?: ValueType["aspectRatio"] | null) {
        return this.add(ShortStyles.aspectRatio, value);
    }

    backfaceVisibility(value?: ValueType["backfaceVisibility"] | null) {
        return this.add(ShortStyles.backfaceVisibility, value);
    }

    /** Add backfaceVisibility */
    baV(value?: ValueType["backfaceVisibility"] | null) {
        return this.add(ShortStyles.backfaceVisibility, value);
    }

    backgroundColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.backgroundColor, value);
    }

    /** Add backgroundColor */
    baC(value?: Colors<"$co"> | null) {
        return this.backgroundColor(value);
    }

    borderBottomColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.borderBottomColor, value);
    }

    /** Add borderBottomColor */
    boBC(value?: Colors<"$co"> | null) {
        return this.borderBottomColor(value)
    }

    borderBottomLeftRadius(value?: ValueType["borderBottomLeftRadius"] | null) {
        return this.add(ShortStyles.borderBottomLeftRadius, value);
    }

    /** Add borderBottomLeftRadius */
    boBLR(value?: ValueType["borderBottomLeftRadius"] | null) {
        return this.add(ShortStyles.borderBottomLeftRadius, value);
    }

    borderBottomRightRadius(value?: ValueType["borderBottomRightRadius"] | null) {
        return this.add(ShortStyles.borderBottomRightRadius, value);
    }

    /** Add borderBottomRightRadius */
    boBRR(value?: ValueType["borderBottomRightRadius"] | null) {
        return this.add(ShortStyles.borderBottomRightRadius, value);
    }

    borderBottomWidth(value?: ValueType["borderBottomWidth"] | null) {
        return this.add(ShortStyles.borderBottomWidth, value);
    }

    /** Add borderBottomWidth */
    boBW(value?: ValueType["borderBottomWidth"] | null) {
        return this.add(ShortStyles.borderBottomWidth, value);
    }

    borderColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.borderColor, value);
    }

    /** Add borderColor */
    boC(value?: Colors<"$co"> | null) {
        return this.borderColor(value)
    }

    borderLeftColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.borderLeftColor, value);
    }

    /** Add borderLeftColor */
    boLC(value?: Colors<"$co"> | null) {
        return this.borderLeftColor(value)
    }

    borderLeftWidth(value?: ValueType["borderLeftWidth"] | null) {
        return this.add(ShortStyles.borderLeftWidth, value);
    }

    /** Add borderLeftWidth */
    boLW(value?: ValueType["borderLeftWidth"] | null) {
        return this.add(ShortStyles.borderLeftWidth, value);
    }

    borderRadius(value?: BorderRadius | null) {
        if (value && typeof value == "string" && value.startsWith("$"))
            return this.classNames(value.substring(1))
        return this.add(ShortStyles.borderRadius, value);
    }

    /** Add borderRadius */
    boR(value?: BorderRadius | null) {
        return this.borderRadius(value);
    }

    borderRightColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.borderRightColor, value);
    }

    /** Add borderRightColor */
    boRC(value?: Colors<"$co"> | null) {
        return this.borderRightColor(value)
    }

    borderRightWidth(value?: ValueType["borderRightWidth"] | null) {
        return this.add(ShortStyles.borderRightWidth, value);
    }

    /** Add borderRightWidth */
    boRW(value?: ValueType["borderRightWidth"] | null) {
        return this.add(ShortStyles.borderRightWidth, value);
    }

    borderStyle(value?: ValueType["borderStyle"] | null) {
        return this.add(ShortStyles.borderStyle, value);
    }

    /** Add borderStyle */
    boS(value?: ValueType["borderStyle"] | null) {
        return this.add(ShortStyles.borderStyle, value);
    }

    borderTopColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.borderTopColor, value);
    }

    /** Add borderTopColor */
    boTC(value?: Colors<"$co"> | null) {
        return this.borderTopColor(value)
    }

    borderTopLeftRadius(value?: ValueType["borderTopLeftRadius"] | null) {
        return this.add(ShortStyles.borderTopLeftRadius, value);
    }

    /** Add borderTopLeftRadius */
    boTLR(value?: ValueType["borderTopLeftRadius"] | null) {
        return this.add(ShortStyles.borderTopLeftRadius, value);
    }

    borderTopRightRadius(value?: ValueType["borderTopRightRadius"] | null) {
        return this.add(ShortStyles.borderTopRightRadius, value);
    }

    /** Add borderTopRightRadius */
    boTRR(value?: ValueType["borderTopRightRadius"] | null) {
        return this.add(ShortStyles.borderTopRightRadius, value);
    }

    borderTopWidth(value?: ValueType["borderTopWidth"] | null) {
        return this.add(ShortStyles.borderTopWidth, value);
    }

    /** Add borderTopWidth */
    boTW(value?: ValueType["borderTopWidth"] | null) {
        return this.add(ShortStyles.borderTopWidth, value);
    }

    borderWidth(value?: ValueType["borderWidth"] | null) {
        return this.add(ShortStyles.borderWidth, value);
    }

    /** Add borderWidth */
    boW(value?: ValueType["borderWidth"] | null) {
        return this.add(ShortStyles.borderWidth, value);
    }

    bottom(value?: ValueType["bottom"] | null) {
        return this.add(ShortStyles.bottom, value);
    }

    /** Add bottom */
    bo(value?: ValueType["bottom"] | null) {
        return this.add(ShortStyles.bottom, value);
    }

    color(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.color, value);
    }

    /** Add color */
    co(value?: Colors<"$co"> | null) {
        return this.color(value);
    }

    direction(value?: ValueType["direction"] | null) {
        return this.add(ShortStyles.direction, value);
    }

    /** Add direction */
    dir(value?: ValueType["direction"] | null) {
        return this.add(ShortStyles.direction, value);
    }

    display(value?: ValueType["display"] | null) {
        return this.add(ShortStyles.display, value);
    }

    /** Add display */
    di(value?: ValueType["display"] | null) {
        return this.add(ShortStyles.display, value);
    }

    elevation(value?: ValueType["elevation"] | null) {
        return this.add(ShortStyles.elevation, value);
    }

    /** Add elevation */
    el(value?: ValueType["elevation"] | null) {
        return this.add(ShortStyles.elevation, value);
    }

    flex(value?: ValueType["flex"] | null) {
        return this.add(ShortStyles.flex, value);
    }

    /** Add Flex */
    fl(value?: ValueType["flex"] | null) {
        return this.add(ShortStyles.flex, value);
    }

    flexBasis(value?: ValueType["flexBasis"] | null) {
        return this.add(ShortStyles.flexBasis, value);
    }

    /** Add flexBasis */
    flB(value?: ValueType["flexBasis"] | null) {
        return this.add(ShortStyles.flexBasis, value);
    }

    flexDirection(value?: ValueType["flexDirection"] | null) {
        return this.add(ShortStyles.flexDirection, value);
    }

    /** Add flexDirection */
    flD(value?: ValueType["flexDirection"] | null) {
        return this.add(ShortStyles.flexDirection, value);
    }

    flexGrow(value?: ValueType["flexGrow"] | null) {
        return this.add(ShortStyles.flexGrow, value);
    }

    /** Add flexGrow */
    flG(value?: ValueType["flexGrow"] | null) {
        return this.add(ShortStyles.flexGrow, value);
    }

    flexShrink(value?: ValueType["flexShrink"] | null) {
        return this.add(ShortStyles.flexShrink, value);
    }

    /** Add flexShrink */
    flS(value?: ValueType["flexShrink"] | null) {
        return this.add(ShortStyles.flexShrink, value);
    }

    flexWrap(value?: ValueType["flexWrap"] | null) {
        return this.add(ShortStyles.flexWrap, value);
    }

    /** Add flexWrap */
    flW(value?: ValueType["flexWrap"] | null) {
        return this.add(ShortStyles.flexWrap, value);
    }

    fontFamily(value?: ValueType["fontFamily"] | null) {
        return this.add(ShortStyles.fontFamily, value);
    }

    /** Add fontFamily */
    foF(value?: ValueType["fontFamily"] | null) {
        return this.add(ShortStyles.fontFamily, value);
    }

    fontSize(value?: FontSizes | null) {
        if (typeof value == "string" && value.startsWith("$"))
            return this.classNames(value.substring(1))
        return this.add(ShortStyles.fontSize, value);
    }

    /** Add fontSize */
    foS(value?: FontSizes | null) {
        return this.fontSize(value);
    }

    fontStyle(value?: ValueType["fontStyle"] | null) {
        return this.add(ShortStyles.fontStyle, value);
    }

    fontVariant(value?: ValueType["fontVariant"] | null) {
        return this.add(ShortStyles.fontVariant, value);
    }

    /** Add fontVariant */
    foV(value?: ValueType["fontVariant"] | null) {
        return this.add(ShortStyles.fontVariant, value);
    }

    fontWeight(value?: ValueType["fontWeight"] | null) {
        return this.add(ShortStyles.fontWeight, value);
    }

    /** Add fontWeight */
    foW(value?: ValueType["fontWeight"] | null) {
        return this.add(ShortStyles.fontWeight, value);
    }

    height(value?: SizeValue<"%"> | SizeValue<"vh"> | null) {
        return this.add(ShortStyles.height, value);
    }

    /** Add height */
    he(value?: SizeValue<"%"> | SizeValue<"vh"> | null) {
        return this.height(value);
    }

    includeFontPadding(value?: ValueType["includeFontPadding"] | null) {
        return this.add(ShortStyles.includeFontPadding, value);
    }

    /** Add includeFontPadding */
    inFP(value?: ValueType["includeFontPadding"] | null) {
        return this.add(ShortStyles.includeFontPadding, value);
    }

    justifyContent(value?: ValueType["justifyContent"] | null) {
        return this.add(ShortStyles.justifyContent, value);
    }

    /** Add justifyContent */
    juC(value?: ValueType["justifyContent"] | null) {
        return this.add(ShortStyles.justifyContent, value);
    }

    left(value?: ValueType["left"] | null) {
        return this.add(ShortStyles.left, value);
    }

    /** Add left */
    le(value?: ValueType["left"] | null) {
        return this.add(ShortStyles.left, value);
    }

    letterSpacing(value?: Spacing | null) {
        if (typeof value == "string" && value.startsWith("$"))
            return this.classNames(value.substring(1))
        return this.add(ShortStyles.letterSpacing, value);
    }

    /** Add letterSpacing */
    leS(value?: Spacing | null) {
        return this.letterSpacing(value);
    }

    lineHeight(value?: ValueType["lineHeight"] | null) {
        return this.add(ShortStyles.lineHeight, value);
    }

    /** Add lineHeight */
    liH(value?: ValueType["lineHeight"] | null) {
        return this.add(ShortStyles.lineHeight, value);
    }

    marginBottom(value?: ValueType["marginBottom"] | null) {
        return this.add(ShortStyles.marginBottom, value);
    }

    /** Add marginBottom */
    maB(value?: ValueType["marginBottom"] | null) {
        return this.add(ShortStyles.marginBottom, value);
    }

    marginHorizontal(value?: ValueType["marginHorizontal"] | null) {
        return this.add(ShortStyles.marginHorizontal, value);
    }

    /** Add marginHorizontal */
    maHo(value?: ValueType["marginHorizontal"] | null) {
        return this.add(ShortStyles.marginHorizontal, value);
    }

    marginLeft(value?: ValueType["marginLeft"] | null) {
        return this.add(ShortStyles.marginLeft, value);
    }

    /** Add marginLeft */
    maL(value?: ValueType["marginLeft"] | null) {
        return this.add(ShortStyles.marginLeft, value);
    }

    marginRight(value?: ValueType["marginRight"] | null) {
        return this.add(ShortStyles.marginRight, value);
    }

    /** Add marginRight */
    maR(value?: ValueType["marginRight"] | null) {
        return this.add(ShortStyles.marginRight, value);
    }

    marginTop(value?: ValueType["marginTop"] | null) {
        return this.add(ShortStyles.marginTop, value);
    }

    /** Add marginTop */
    maT(value?: ValueType["marginTop"] | null) {
        return this.add(ShortStyles.marginTop, value);
    }

    marginVertical(value?: ValueType["marginVertical"] | null) {
        return this.add(ShortStyles.marginVertical, value);
    }

    /** Add marginVertical */
    maV(value?: ValueType["marginVertical"] | null) {
        return this.add(ShortStyles.marginVertical, value);
    }

    maxHeight(value?: SizeValue<"%"> | SizeValue<"vh"> | null) {
        return this.add(ShortStyles.maxHeight, value);
    }

    /** Add maxHeight */
    maH(value?: SizeValue<"%"> | SizeValue<"vh"> | null) {
        return this.maxHeight(value);
    }

    maxWidth(value?: SizeValue<"%"> | SizeValue<"vw"> | null) {
        return this.add(ShortStyles.maxWidth, value);
    }

    /** Add maxWidth */
    maW(value?: SizeValue<"%"> | SizeValue<"vw"> | null) {
        return this.maxWidth(value);
    }

    minHeight(value?: SizeValue<"%"> | SizeValue<"vh"> | null) {
        return this.add(ShortStyles.minHeight, value);
    }

    /** Add minHeight */
    miH(value?: SizeValue<"%"> | SizeValue<"vh"> | null) {
        return this.minHeight(value);
    }

    minWidth(value?: SizeValue<"%"> | SizeValue<"vw"> | null) {
        return this.add(ShortStyles.minWidth, value);
    }

    /** Add minWidth */
    miW(value?: SizeValue<"%"> | SizeValue<"vw"> | null) {
        return this.miW(value);
    }

    opacity(value?: ValueType["opacity"] | null) {
        return this.add(ShortStyles.opacity, value);
    }

    /** Add opacity */
    op(value?: ValueType["opacity"] | null) {
        return this.add(ShortStyles.opacity, value);
    }

    overflow(value?: ValueType["overflow"] | null) {
        return this.add(ShortStyles.overflow, value);
    }

    /** Add overflow */
    ov(value?: ValueType["overflow"] | null) {
        return this.add(ShortStyles.overflow, value);
    }

    overlayColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.overlayColor, value);
    }

    /** Add overlayColor */
    ovC(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.overlayColor, value);
    }

    paddingBottom(value?: ValueType["paddingBottom"] | null) {
        return this.add(ShortStyles.paddingBottom, value);
    }

    /** Add paddingBottom */
    paB(value?: ValueType["paddingBottom"] | null) {
        return this.add(ShortStyles.paddingBottom, value);
    }

    paddingHorizontal(value?: ValueType["paddingHorizontal"] | null) {
        return this.add(ShortStyles.paddingHorizontal, value);
    }

    /** Add paddingHorizontal */
    paH(value?: ValueType["paddingHorizontal"] | null) {
        return this.add(ShortStyles.paddingHorizontal, value);
    }

    paddingLeft(value?: ValueType["paddingLeft"] | null) {
        return this.add(ShortStyles.paddingLeft, value);
    }

    /** Add paddingLeft */
    paL(value?: ValueType["paddingLeft"] | null) {
        return this.add(ShortStyles.paddingLeft, value);
    }

    paddingRight(value?: ValueType["paddingRight"] | null) {
        return this.add(ShortStyles.paddingRight, value);
    }

    /** Add paddingRight */
    paR(value?: ValueType["paddingRight"] | null) {
        return this.add(ShortStyles.paddingRight, value);
    }

    paddingTop(value?: ValueType["paddingTop"] | null) {
        return this.add(ShortStyles.paddingTop, value);
    }

    /** Add paddingTop */
    paT(value?: ValueType["paddingTop"] | null) {
        return this.add(ShortStyles.paddingTop, value);
    }

    paddingVertical(value?: ValueType["paddingVertical"] | null) {
        return this.add(ShortStyles.paddingVertical, value);
    }

    /** Add paddingVertical */
    paV(value?: ValueType["paddingVertical"] | null) {
        return this.add(ShortStyles.paddingVertical, value);
    }

    position(value?: ValueType["position"] | null) {
        return this.add(ShortStyles.position, value);
    }

    /** Add position */
    po(value?: ValueType["position"] | null) {
        return this.add(ShortStyles.position, value);
    }

    resizeMode(value?: ValueType["resizeMode"] | null) {
        return this.add(ShortStyles.resizeMode, value);
    }

    /** Add resizeMode */
    reM(value?: ValueType["resizeMode"] | null) {
        return this.add(ShortStyles.resizeMode, value);
    }

    right(value?: ValueType["right"] | null) {
        return this.add(ShortStyles.right, value);
    }

    /** Add right */
    ri(value?: ValueType["right"] | null) {
        return this.add(ShortStyles.right, value);
    }

    shadowColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.shadowColor, value);
    }

    /** Add shadowColor */
    shC(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.shadowColor, value);
    }

    shadowOffset(value?: ValueType["shadowOffset"] | null) {
        return this.add(ShortStyles.shadowOffset, value);
    }

    shadowOpacity(value?: ValueType["shadowOpacity"] | null) {
        return this.add(ShortStyles.shadowOpacity, value);
    }

    /** Add shadowOpacity */
    shO(value?: ValueType["shadowOpacity"] | null) {
        return this.add(ShortStyles.shadowOpacity, value);
    }

    shadowRadius(value?: ValueType["shadowRadius"] | null) {
        return this.add(ShortStyles.shadowRadius, value);
    }

    /** Add shadowRadius */
    shR(value?: ValueType["shadowRadius"] | null) {
        return this.add(ShortStyles.shadowRadius, value);
    }

    textAlign(value?: ValueType["textAlign"] | null) {
        return this.add(ShortStyles.textAlign, value);
    }

    /** Add textAlign */
    teA(value?: ValueType["textAlign"] | null) {
        return this.add(ShortStyles.textAlign, value);
    }

    textAlignVertical(value?: ValueType["textAlignVertical"] | null) {
        return this.add(ShortStyles.textAlignVertical, value);
    }

    /** Add textAlignVertical */
    teAV(value?: ValueType["textAlignVertical"] | null) {
        return this.add(ShortStyles.textAlignVertical, value);
    }

    textDecorationColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.textDecorationColor, value);
    }

    /** Add textDecorationColor */
    teDC(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.textDecorationColor, value);
    }

    textDecorationLine(value?: ValueType["textDecorationLine"] | null) {
        return this.add(ShortStyles.textDecorationLine, value);
    }

    /** Add textDecorationLine */
    teDL(value?: ValueType["textDecorationLine"] | null) {
        return this.add(ShortStyles.textDecorationLine, value);
    }

    textDecorationStyle(value?: ValueType["textDecorationStyle"] | null) {
        return this.add(ShortStyles.textDecorationStyle, value);
    }

    /** Add textDecorationStyle */
    teDS(value?: ValueType["textDecorationStyle"] | null) {
        return this.add(ShortStyles.textDecorationStyle, value);
    }

    textShadowColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.textShadowColor, value);
    }

    /** Add textShadowColor */
    teSC(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.textShadowColor, value);
    }

    /*
      use style insted
      textShadowOffset(value?: ValueType["textShadowOffset"] | null) {
        return this.add(ShortStyles.textShadowOffset, value);
      }
    
      teSO(value?: ValueType["textShadowOffset"] | null) {
        return this.add(ShortStyles.textShadowOffset, value);
      }
     */

    textShadowRadius(value?: ValueType["textShadowRadius"] | null) {
        return this.add(ShortStyles.textShadowRadius, value);
    }

    /** Add textShadowRadius */
    teSR(value?: ValueType["textShadowRadius"] | null) {
        return this.add(ShortStyles.textShadowRadius, value);
    }

    tintColor(value?: Colors<"$co"> | null) {
        return this.add(ShortStyles.tintColor, value);
    }

    /** Add tintColor */
    tiC(value?: Colors<"$co"> | null) {
        return this.tintColor(value)
    }

    top(value?: ValueType["top"] | null) {
        return this.add(ShortStyles.top, value);
    }

    /** Add top */
    to(value?: ValueType["top"] | null) {
        return this.add(ShortStyles.top, value);
    }

    /*
     dose not handle objects, use style insted
     transform(value?: ValueType["transform"] | null) {
       return this.add(ShortStyles.transform, value);
     }
   
     tr(value?: ValueType["transform"] | null) {
       return this.add(ShortStyles.transform, value);
     }*/

    width(value?: SizeValue<"%"> | SizeValue<"vw"> | null) {
        return this.add(ShortStyles.width, value);
    }

    /** Add width */
    wi(value?: SizeValue<"%"> | SizeValue<"vw"> | null) {
        return this.width(value);
    }

    writingDirection(value?: ValueType["writingDirection"] | null) {
        return this.add(ShortStyles.writingDirection, value);
    }

    /** Add writingDirection */
    wrD(value?: ValueType["writingDirection"] | null) {
        return this.add(ShortStyles.writingDirection, value);
    }

    zIndex(value?: zIndex | null) {
        return this.add(ShortStyles.zIndex, value);
    }

    /** Add zIndex */
    zI(value?: zIndex | null) {
        return this.add(ShortStyles.zIndex, value);
    }
}

// specific only for nested StyleSheet
export class CSSStyleSheetStyle extends CSSStyle {
    private eqs: { css: CSSStyleSheetStyle | string, index: string | number }[] = [];

    //** override all css with this */
    important() {
        if (this.value.indexOf("!important") == -1)
            this.value += " !important";
        return this;
    }

    child(indexOrClassOrViewName: (number | "last" | (string & {})), css: ((x: CSSStyleSheetStyle) => CSSStyleSheetStyle) | string) {
        if (!css)
            throw "CSSStyleSheetStyle.view must containes css style";
        let value: { css: CSSStyleSheetStyle, index: string | number } = {
            index: indexOrClassOrViewName,
            css: {} as any
        }
        if (typeof css == "function")
            value.css = css(new CSSStyleSheetStyle()) as CSSStyleSheetStyle;
        this.eqs.push(value);
        return this;
    }

    /** Used in NestedStyleSheet */
    getEqs(parentKey, item?: CSSStyleSheetStyle) {
        let items: { key: string, css: string }[] = [];
        for (let value of (item ?? this).eqs) {
            let k = `${parentKey}_${value.index}`;
            if (typeof value.index == "string" && value.index != "last")
                k = `${parentKey}$${value.index}`;

            let css: any = value.css;
            if (value.css instanceof CSSStyleSheetStyle) {

                if (value.css.eqs && value.css.eqs.length > 0)
                    items = [...items, ...this.getEqs(k, value.css)]
            }
            items.push({ key: k, css: css.toString() })
        }

        return items;
    }

    props<T extends object>(props: Omit<CSSProps<T>, "ref">) {
        if (!props)
            return;
        if (Array.isArray(props)) {
            throw "CSSStyle props only accept json object";
        }
        let json = JSON.stringify(props, (k, v) => {
            if (v instanceof Function) {
                {
                    if (k != "css")
                        console.warn("CSSStyle props dose not accept Functions props other then function for css", "so", k, "will be ignored")
                    else return (v(new CSSStyleSheetStyle()) as CSSStyle).toString();
                }
            }

            return v;
        });
        this.add("props:", json);
        return this;
    }
}

