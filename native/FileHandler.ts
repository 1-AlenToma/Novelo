import * as FileSystem from "expo-file-system";
import {
  useState,
  useEffect,
  useRef
} from "react";
import { newId } from "../Methods";
export type Dir = "Cache" | "File";
type Fnc = (
  type: "Write" | "Delete",
  file: string
) => void;
let events = {};

export default class FileHandler {
  dir: string;
  handlerId: string = newId();
  constructor(dir: string, dirType?: Dir) {
    events[this.handlerId] = {
      values: () =>
        Object.keys(events[this.handlerId])
          .filter(x => x !== "values")
          .map(x => events[this.handlerId][x])
    };
    this.dir = (
      !dirType || dirType == "Cache"
        ? FileSystem.cacheDirectory
        : FileSystem.documentDirectory
    ).path(dir);
  }

  trigger(
    op: string,
    fileName: string,
    fullName: string
  ) {
    events[this.handlerId]
      .values()
      .forEach(x => x(op, fileName, fullName));
  }

  useFile(
    globalType?: "json" | "utf8" | "base64",
    validator?: (x: any) => boolean,
    updateState?: "New"
  ) {
    const id = useRef(newId()).current;
    const files = useRef([]);
    const [fileItems, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    events[this.handlerId][id] = async (
      op,
      fileName,
      fullName
    ) => {
      if (
        updateState === "New" &&
        files.current.find(
          x => x === fileName || x == fullName
        )
      )
        return;
      await setLoading(true);
      files.current = await this.allFiles();
      await loadItems();
    };

    useEffect(() => {
      events[this.handlerId][id]();
      return () => {
        if (this.events[this.handlerId][id]) {
          delete this.events[this.handlerId][id];
        }
      };
    }, []);

    const loadItems = async () => {
      await setLoading(true);
      let ims = [];
      for (let file of files.current) {
        try {
          let item = await loadContent(
            file,
            globalType
          );
          if (validator) {
            if (validator(item)) {
              ims.push(item);
              break;
            }
          } else ims.push(item);
        } catch (e) {
          console.log(e)
        }
      }

      await setItems(ims);
      await setLoading(false);
    };

    loadContent = async (
      file: string,
      type?: "json" | "utf8" | "base64"
    ) => {
      let item = await this.read(
        file,
        type && type != "json" ? type : "utf8"
      );
      if (type === "json") {
        let tm = JSON.parse(item);
        tm.deleteFile = async () => {
          await this.delete(file);
        };
        return tm;
      }
      return item;
    };

    return {
      fileItems,
      loading,
      files: files.current,
      loadContent
    };
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
    this.trigger("Delete", file, fileUri);
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
    this.trigger("Write", file, fileUri);
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
    console.log("reading", fileUri);
    if (await this.exists(file)) {
      return await FileSystem.readAsStringAsync(
        fileUri,
        {
          encoding: type || "utf8"
        }
      );
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