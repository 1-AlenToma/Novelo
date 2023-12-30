import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {Book} from './db/index'

export default function App() {
	let book =new Book().Name("test")
	return (
	<View style={styles.container}>
      <Text>
      {JSON.stringify(book)}
	</Text>
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