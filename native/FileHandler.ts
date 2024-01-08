import * as FileSystem from "expo-file-system";
export type Dir = "Cache" | "File";
export default class FileHandler {
  dir: string;
  constructor(dir: string, dirType: Dir) {
    this.dir =
      (!dirType || dirType == "Cache"
        ? FileSystem.cacheDirectory
        : FileSystem.documentDirectory) + dir;
  }

  getName(file: string) {
    file = this.dir + file;
    if (file.startsWith("/"))
      file = `file://${file}`;
    else if (!file.startsWith("file"))
      file = `file:///${file}`;
    return file;
  }

  async exists(file: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    let fileInfo =
      await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists;
  }

  async delete(file: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    await FileSystem.deleteAsync(fileUri);
  }

  async write(file: string, content: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    await FileSystem.writeAsStringAsync(
      fileUri,
      content
    );
  }

  async allFiles() {
    await this.checkDir();
    let fileUri = this.getName("");
    return await FileSystem.readDirectoryAsync(
      fileUri
    );
  }

  async read(file: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    console.log("reading", fileUri);
    return await FileSystem.readAsStringAsync(
      fileUri,
      {
        encoding: "utf8"
      }
    );
  }

  async deleteDir() {
    await FileSystem.deleteLegacyDocumentDirectoryAndroid(
      this.dir
    );
  }

  private async checkDir() {
    const dirInfo = await FileSystem.getInfoAsync(
      this.dir
    );
    if (!dirInfo.exists) {
      console.log(
        this.dir,
        "directory doesn't exist, creating…"
      );
      await FileSystem.makeDirectoryAsync(
        this.dir,
        { intermediates: true }
      );
    }
  }
}
