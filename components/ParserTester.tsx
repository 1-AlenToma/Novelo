import { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Parser } from "../native";
import useLoader from "./Loader";
import { SearchDetail } from "../native"

export default ({ parser }: { parse: Parser }) {
	const [p] = useState(new parser());
	const loader = useLoader(true);
	const [logs, setLogs] = useState([]);
	const lastItems = useRef({});
	const tryfn = async (id: string, fn: Function) => {
		let item = { id, text: "testing-", items: [] }
		try {
			let v = await fn();
			if (!a) {
				item.text += "value is null";
			} else {
				if (Array.isArray(v))
					v = [0];
				lastItems.current = v;
				Object.keys(v).forEach(k => {
					item.items.push(`${k}:${v[k]}`);
				})
			}
		} catch (e) {
			item.text += "failed";
		}

		setLogs([...logs, item]);
	}
	useEffect(() => {
		(() => {
			await tryfn("load", () => await p.load());
			await tryfn("search", () => await p.search(SearchDetail.n().Text("g")));
		})();
	}, [])
	return (
		<View style={styles.container}>
		  {
		  	logs.map((x,i)=>
		  	(
		  	<>
		  	  <View key={i} style={styles.textContainer}>
		  			<Text style={styles.txt}>{x.id}</Text>
		  			<Text style={styles.txt}>{x.text}</Text>
		  	  </View>
		  	  {
		  	  	x.items.map((f,index)=>(
		  	  	<Text style={styles.txt}>{f}</Text>
		  	  	))
		  	  }
		  	  </>
		  	)
		  	)
		  }
		</View>
	)


}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1F1E17"
	},
	textContainer: {
		flexDirection: "row",
		justifyContent: "center",
		width:"100%"
	},
	txt: {
		fontSize: 12,
		fontWight: "bold",
		color: "#ffffff",
		padding: 10,
		borderBottomColor: "#fff",
		borderBottomWidth: 1,
		width:"100%"
	}

})