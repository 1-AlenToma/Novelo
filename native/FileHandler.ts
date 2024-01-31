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
export default class FileHandler {
  dir: string;
  events: any;
  constructor(dir: string, dirType: Dir) {
    this.events = {
      values: () =>
        Object.keys(this.events).map(
          x => this.events[x]
        )
    };
    this.dir =
      (!dirType || dirType == "Cache"
        ? FileSystem.cacheDirectory
        : FileSystem.documentDirectory) + dir;
    if (!this.dir.endsWith("/")) this.dir += "/";
  }

  trigger(op: string, url: string) {
    this.events.values().forEach(x => x(op, url));
  }

  useFile(
    globalType?: "json" | "utf8" | "base64"
  ) {
    const id = useRef(newId()).current;
    const [files, setFiles] = useState([]);
    const [fileItems, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    this.events[id] = (op, url) => {
      if (op === "Write") {
        this.allFiles().then(fls =>
          setFiles(fls)
        );
      } else {
        setFiles([
          ...files.filter(x => x !== url)
        ]);
      }
    };
    useEffect(() => {
      (async () => {
        setLoading(true);
        let fs = await this.allFiles();
        if (fs.length <= 0) setLoading(false);
        setFiles(fs);
      })();
      return () => {
        delete this.events[id];
      };
    }, []);

    useEffect(() => {
      setLoading(true);
      (async () => {
        let ims = [];
        for (let file of files) {
          let item = await loadContent(
            file,
            globalType
          );
          ims.push(item);
        }

        setItems(ims);
        setLoading(false);
      })();
    }, [files]);

    loadContent = async (
      file: string,
      type?: "json" | "utf8" | "base64"
    ) => {
      let item = await this.read(
        file,
        type && type != "json" ? type : "utf8"
      );
      if (type === "json")
        return JSON.parse(item);
      return item;
    };

    return { fileItems,loading, files, loadContent };
  }

  getName(file: string) {
    // its full path
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
    this.trigger("Delete", fileUri);
  }

  async write(file: string, content: string) {
    await this.checkDir();
    let fileUri = this.getName(file);
    await FileSystem.writeAsStringAsync(
      fileUri,
      content
    );
    this.trigger("Write", fileUri);
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
    return await FileSystem.readAsStringAsync(
      fileUri,
      {
        encoding: type || "utf8"
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
