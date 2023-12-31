import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {Book} from './db/index';
import "./Global.d"
import ParserTester from "./components/ParserTester";
import Parser from "./parsers/ReadNovelFull";

export default function App() {
	return (
	<View style={styles.container}>
      <ParserTester parser={Parser} />
		<StatusBar style="auto" />
	</View>
	);
	}

	const styles = StyleSheet.create({
	container: {
	flex: 1,
	backgroundColor: '#fff',
	alignItems: 'center',
	justifyContent: 'center',
	},
	});