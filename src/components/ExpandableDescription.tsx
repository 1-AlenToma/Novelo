import React from 'react';
import { View, Text, TouchableOpacity } from "react-native-short-style"
import {
    LayoutAnimation,
    UIManager,
    Platform,
} from 'react-native';
/*
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}*/

const clean = (txt: string) => {
    txt = methods.generateText(txt ?? "", 100);
    txt = (txt ?? "").replace(/<p>/g, "").replace(/<\/p>/g, "\n").trimStr("\n")
    return txt.replace(/(<([^>]+)>)/g, "")
}

interface ExpandableTextProps {
    text: string;
    numberOfLines?: number;
    ifTrue?: any
}

export const ExpandableDescription: React.FC<ExpandableTextProps> = ({ text, numberOfLines = 3, ifTrue }) => {
    text = clean(text);
    const [expanded, setExpanded] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [fullHeight, setFullHeight] = useState(0);
    const [limitedHeight, setLimitedHeight] = useState(0);



    const onFullTextLayout = (event: any) => {
        const height = event.nativeEvent.layout.height;
        setFullHeight(height);
    };

    const onLimitedTextLayout = (event: any) => {
        const height = event.nativeEvent.layout.height;
        setLimitedHeight(height);
    };

    useEffect(() => {
        if (fullHeight && limitedHeight && fullHeight > limitedHeight) {
            setShowMore(true);
        }
    }, [fullHeight, limitedHeight]);

    const toggle = () => {
        LayoutAnimation.easeInEaseOut();
        setExpanded(prev => !prev);
    };

    if (methods.ifSelector(ifTrue) == false)
        return null;

    const textCss = "fos-16 lih-22 invert"

    return (
        <View css={"pa-12 invert bac-transparent"}>
            {/* Invisible full text (used for measuring) */}
            <Text
                selectable={true}
                css={textCss}
                style={{ position: 'absolute', top: 10000, opacity: 0, width: '100%' }}
                onLayout={onFullTextLayout}
            >
                {text}
            </Text>

            {/* Visible limited/expanded text */}
            <Text
                selectable={true}
                css={textCss}
                numberOfLines={expanded ? undefined : numberOfLines}
                onLayout={onLimitedTextLayout}
            >
                {text}
            </Text>

            {/* Show "More"/"Less" if needed */}
            {showMore && (
                <TouchableOpacity css="bac-transparent" onPress={toggle}>
                    <Text css={"co:#bf6416 fow-bold mat-6"}>{expanded ? 'Less' : 'More'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};



