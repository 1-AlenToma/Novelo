import { IStorage, DataCache } from "../Types";
import {
  Session,
  dbContext,
  IDatabase,
  TableNames
} from "../db";

class Storage implements IStorage {
  db: IDatabase<TableNames>;
  constructor() {
    this.db = new dbContext().database;
  }

  async set(file: string, value: DataCache) {
    await this.db.save(
      Session.n()
        .File(file)
        .Date(value.date)
        .Data(JSON.stringify(value))
    );
  }

  async get(file: string) {
    let item = await this.db
      .querySelector<Session>("Sessions")
      .Where.Column(x => x.file)
      .EqualTo(file)
      .firstOrDefault();
    if (item) {
      item.data = JSON.parse(item.data);
    }
    return item || null;
  }

  async has(file: string) {
    let item = await this.db
      .querySelector<Session>("Sessions")
      .Where.Column(x => x.file)
      .EqualTo(file)
      .firstOrDefault();
    return item !== undefined && item !== null;
  }

  async delete(...files: string[]) {
    await this.db
      .querySelector<Session>("Sessions")
      .Where.Column(x => x.file)
      .IN(files)
      .delete();
  }

  async getFiles(files?: string[]) {
    if (files || files.length > 0)
      return (
        await this.db
          .querySelector<Session>("Sessions")
          .Where.Column(x => x.file)
          .IN(files)
          .toList()
      ).map(x => x.file);

    return (
      await this.db
        .querySelector<Session>("Sessions")
        .toList()
    ).map(x => x.file);
  }
}

export default Storage;
