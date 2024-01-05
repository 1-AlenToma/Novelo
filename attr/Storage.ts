import { IStorage, DataCache } from "../Types";
import AsyncStorage from "@react-native-async-storage/async-storage";

class Storage implements IStorage {
  async set(file: string, value: DataCache) {
    await AsyncStorage.setItem(
      file,
      JSON.stringify(value)
    );
  }

  async get(file: string) {
    let data = await AsyncStorage.getItem(file);
    return data ? JSON.parse(data) : null;
  }

  async has(file: string) {
    let data = await AsyncStorage.getItem(file);
    return (data ?? "").has();
  }

  async delete(...files: string[]) {
    await AsyncStorage.multiRemove(files);
  }

  async getFiles(files?: string[]) {
    return AsyncStorage.getAllKeys();
  }
}

export default Storage;
