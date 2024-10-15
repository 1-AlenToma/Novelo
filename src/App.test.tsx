import { View, Text } from "react-native"
import * as React from "react";
import "./tests/global.Test"
export default ({ files }: { files?: string[] }) => {

    const run = () => {
        tests.forEach(x => x.exec());
    }
    React.useEffect(() => {
        run();
    })

    return (
        <View onTouchEnd={run} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Testning read log</Text>
        </View>
    )
}