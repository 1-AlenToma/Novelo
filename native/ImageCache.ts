import * as FileSystem from "expo-file-system";
import {
  useState,
  useEffect,
  useRef
} from "react";
import { newId } from "../Methods";

type Fnc = (
  type: "Write" | "Delete",
  file: string
) => void;

export default class ImageCache {
  dir: string;
  constructor() {
    this.dir =
      FileSystem.documentDirectory.path("Images");
  }

  getName(file: string) {
    // its full path
    let types = [".json", ".html", ".epub"];
    if (
      file &&
      file.has() &&
      !types.find(x => file.has(x))
    )
      file += ".json";
    if (file.startsWith("file")) return file;
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
    await FileSystem.writeAsStringAsync(
      fileUri,
      content
    );

    return fileUri;
  }

  async allFiles() {
    await this.checkDir();
    let fileUri = this.getName("");
    return await FileSystem.readDirectoryAsync(
      fileUri
    );
  }

  async read(file: string, type?: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    if (await this.exists(file)) {
      let text =
        await FileSystem.readAsStringAsync(
          fileUri,
          {
            encoding: type || "utf8"
          }
        );
      return text;
    } else return undefined;
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
