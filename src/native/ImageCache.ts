import * as FileSystem from "expo-file-system";
import RNF from "react-native-fs";

type Fnc = (
  type: "Write" | "Delete",
  file: string
) => void;

export default class ImageCache {
  dir: string;
  constructor() {
    this.dir = FileSystem.documentDirectory?.path("Images") ?? "";
  }

  getName(file: string) {
    // its full path
    return getFileName(file, this.dir);
  }

  async exists(file: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    return await RNF.exists(fileUri);
  }

  async delete(file: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    if (await this.exists(file))
      await RNF.unlink(fileUri);
  }

  async clearImages(files?: any[]) {
    if(!files)
     return;
    for (let file of files) {
      if (
        file.type == "Image" &&
        file.content.startsWith("file")
      ) {
        await this.delete(file.content);
      }
    }
  }

  async write(file: string, content: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    console.log(
      "writing",
      fileUri,
      "filename",
      file
    );
    await RNF.writeFile(
      fileUri,
      content, 
      "utf8"
    );
    return fileUri;
  }

  async allFiles() {
    await this.checkDir();
    let fileUri = this.getName("");
    let dirs = await RNF.readDir(fileUri);
    return dirs.filter(x => x.isFile()).map(x => x.path);
  }

  async read(file: string, type?: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    if (await this.exists(file)) {
      let text =await RNF.readFile(fileUri, type || "utf8");
      return text;
    } else return undefined;
  }

  async deleteDir() {
    await RNF.unlink(this.dir);
  }

  private async checkDir() {
    const dirInfo = await FileSystem.getInfoAsync(
      this.dir
    );
    if (!await RNF.exists(this.dir)) {
      console.log(
        this.dir,
        "directory doesn't exist, creating…"
      );
      await RNF.mkdir(this.dir);
    }
  }
}
