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
const DownloadedFiles = new Map();
export default class FileHandler {
  dir: string;
  events: any = {};
  disabled: boolean = false;
  constructor(dir: string, dirType?: Dir) {
    this.events = {
      values: () =>
        Object.keys(this.events)
          .filter(x => x !== "values")
          .map(x => this.events[x])
    };
    this.dir = (
      !dirType || dirType == "Cache"
        ? FileSystem.cacheDirectory
        : FileSystem.documentDirectory
    ).path(dir);
  }

  disable() {
    this.disable = true;
  }

  enable() {
    this.disable = false;
    this.trigger("", "", "", true);
  }

  trigger(
    op: string,
    fileName: string,
    fullName: string,
    fromDisabled?: boolean
  ) {
    this.events
      .values()
      .forEach(
        x =>
          x?.(
            op,
            fileName,
            fullName,
            fromDisabled
          )
      );
  }

  useFile(
    globalType?: "json" | "utf8" | "base64",
    validator?: (x: any) => boolean,
    updateState?: "New" | "NewDelete"
  ) {
    const id = useRef(newId()).current;
    const files = useRef([]);
    const [fileItems, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    this.events[id] = async (
      op,
      fileName,
      fullName,
      fromDisabled
    ) => {
      if (this.disabled) {
        return;
      }
      if (!fromDisabled) {
        if (
          (updateState === "New" ||
            (updateState == "NewDelete" &&
              op != "Delete")) &&
          files.current.find(
            x => x === fileName || x == fullName
          )
        ) {
          return;
        }
      }
      await setLoading(true);
      files.current = await this.allFiles();
      await loadItems();
    };

    useEffect(() => {
      if (!this.disabled) this.events[id]();
      return () => {
        if (this.events[id]) {
          delete this.events[id];
        }
      };
    }, []);

    const loadItems = async () => {
      await setLoading(true);
      let ims = [];
      await setItems([]);
      for (let file of files.current) {
        try {
          let item = await loadContent(
            file,
            globalType
          );
          if (!item) continue;
          if (validator) {
            if (validator(item)) {
              ims.push(item);
              break;
            }
          } else ims.push(item);
        } catch (e) {
          console.error(e);
        }
      }

      await setItems(ims);
      await setLoading(false);
    };

    loadContent = async (
      file: string,
      type?: "json" | "utf8" | "base64"
    ) => {
      let g = require("../GlobalContext").default;
      let item = await this.read(
        file,
        type && type != "json" ? type : "utf8"
      );
      if (!item) return item;
      if (type === "json") {
        try {
          let tm = JSON.parse(item);
          tm.deleteFile = async () => {
            await g
              .imageCache()
              .clearImages(tm.files ?? []);
            await this.delete(file);
          };
          return tm;
        } catch (e) {
          console.error(e, file);
        }
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
    DownloadedFiles.delete(fileUri);
    if (await this.exists(file))
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
    DownloadedFiles.set(fileUri, content);
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
    if (DownloadedFiles.has(fileUri))
      return DownloadedFiles.get(fileUri);
    if (await this.exists(file)) {
      let text =
        await FileSystem.readAsStringAsync(
          fileUri,
          {
            encoding: type || "utf8"
          }
        );
      DownloadedFiles.set(fileUri, text);
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
