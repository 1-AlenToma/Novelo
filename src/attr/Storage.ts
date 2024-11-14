import { IStorage, DataCache, FilesPath } from "../Types";
import { FileHandler } from "../native";

class Storage implements IStorage {
  handler: FileHandler;
  constructor() {
    this.handler = new FileHandler(FilesPath.Cache)
  }
  async set(file: string, value: DataCache) {
    await this.handler.write(
      file,
      JSON.stringify(value)
    );
  }

  async get(file: string) {
    let data = await this.handler.read(file);
    return data && !data.empty() ? JSON.parse(data) : null;
  }

  async has(file: string) {
    return await this.handler.exists(file);
  }

  async delete(...files: string[]) {
    for (let f of files)
      await this.handler.delete(f);
  }

  async getFiles() {
    return await this.handler.allFiles();
  }
}

export default Storage;
