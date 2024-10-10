import * as FileSystem from "expo-file-system";
import { newId } from "../Methods";
import { useLoader } from "../components";
import RNF from "react-native-fs";
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
    if (dir.indexOf("/") === -1) {
      this.dir = (
        !dirType || dirType == "Cache"
          ? RNF.CachesDirectoryPath
          : RNF.DocumentDirectoryPath
      )?.path(dir) || "";
    } else // is a full path
    {
      this.dir = dir;
    }
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    if (this.disabled) {
      this.disabled = false;
      this.trigger("", "", "", true);
    }
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
    const files = useRef([] as string[]);
    const [fileItems, setItems] = useState<any[]>([]);
    const loader = useLoader(true);
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
      await loader.show();
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
    useEffect(() => {
      //this.events[id]();
    }, [validator]);

    const loadItems = async () => {
      await loader.show();
      let ims: any[] = [];
      await setItems([]);
      for (let file of files.current) {
        let breakit = false;
        try {
          if (validator) {
            if (validator(file)) breakit = true;
            else continue;
          }
          let item = await loadContent(
            file,
            globalType
          );
          if (!item) continue;
          ims.push(item);
        } catch (e) {
          console.error(e);
        }
        if (breakit) break;
      }

      await setItems(ims);
      await loader.hide();
    };

    const loadContent = async (
      file: string,
      type?: "json" | "utf8" | "base64"
    ) => {
      let item = await this.read(
        file,
        type && type != "json" ? type : "utf8"
      );
      if (!item) return item;
      if (type === "json") {
        try {
          let tm = JSON.parse(item);
          tm.deleteFile = async () => {
            await context
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
      loading: loader.loading,
      files: files.current,
      loadContent,
      elem: loader.elem
    };
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
    DownloadedFiles.delete(fileUri);
    if (await this.exists(file))
      await RNF.unlink(fileUri);
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

    await RNF.writeFile(
      fileUri,
      content,
      "utf8"
    );

    console.log("Finished Wrting", fileUri)
    DownloadedFiles.set(fileUri, content);
    this.trigger("Write", file, fileUri);
  }

  async allFilesInfos(){
    await this.checkDir();
    let fileUri = this.getName("");
    let dirs = await RNF.readDir(fileUri);
    return dirs.filter(x => x.isFile());
  }

  async allFiles() {
    await this.checkDir();
    let fileUri = this.getName("");
    let dirs = await RNF.readDir(fileUri);
    return dirs.filter(x => x.isFile()).map(x => x.path);
  }

  async read(file: string, type?: any) {
    await this.checkDir();
    let fileUri = this.getName(file);
    console.log("reading", fileUri);
    if (DownloadedFiles.has(fileUri))
      return DownloadedFiles.get(fileUri);
    if (await this.exists(file)) {
      let text = await RNF.readFile(fileUri, type || "utf8")
      DownloadedFiles.set(fileUri, text);
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
