import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";

export default (initValue) => {
	const [loading, setLoading] = useState(initValue);
	const [size, setSize] = useState({ x: 0, y: 0, height: 0, width: 0 });

	const show = () => {
		setLoading(true);
	}

	const hide = () => setLoading(false);


	let elem =
		(
			!loading ? null : (
				<View style={{
		position:"absolute",
		flex:1,
		top:0,
		left:0,
		width:"100%",
		height:"100%",
		zIndex:9999
		}} onLayout={event => {
     setSize(event.nativeEvent.layout);
     }}>
		<ActivityIndicator size="large" style={{position:"absolute", left:(size.width/2) -25, top:(size.height/2)-25}} /> 
		</View>)
		)
    return {show, hide, elem,loading};

}