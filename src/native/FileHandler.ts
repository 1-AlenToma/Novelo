import { newId } from "../Methods";
import useLoader from "../components/Loader";
import RNF, { ReadDirItem } from "react-native-fs";
import RNFetchBlob from "rn-fetch-blob";
import { SystemDir, EncodingType, FileInfo } from "../Types";
import MapCacher from "./MapCacher";


export default class FileHandler {
  dir: string;
  events: any = {};
  disabled: boolean = false;
  CachesDirectoryPath: string;
  DocumentDirectoryPath: string;
  DownloadDirectoryPath: string;
  ExternalStorageDirectoryPath: string;
  RNF = RNF;
  enableCaching: boolean;
  DownloadedFiles = new MapCacher(100);
  root: FileInfo;

  constructor(dir: string, dirType?: SystemDir, enableCaching?: boolean) {
    this.DocumentDirectoryPath = RNF.DocumentDirectoryPath;
    this.CachesDirectoryPath = RNF.CachesDirectoryPath;
    this.DownloadDirectoryPath = RNF.DownloadDirectoryPath;
    this.ExternalStorageDirectoryPath = RNF.ExternalStorageDirectoryPath;
    this.enableCaching = enableCaching || false;
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

    this.root = getFileInfo(this.dir);
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
    console.log("Deleting", fileUri)
    if (this.enableCaching)
      this.DownloadedFiles.delete(fileUri);
    if (await this.exists(file))
      await RNF.unlink(fileUri);
    this.trigger("Delete", file, fileUri);
  }

  async write(file: string, content: string | number[], options?: any) {
    let fileUri = this.getName(file);
    await this.checkDir(fileUri);
    console.log(
      "writing",
      fileUri,
      "filename",
      file
    );


    await RNFetchBlob.fs.writeFile(
      fileUri,
      content,
      options ?? "utf8"
    );

    console.log("Finished Wrting", fileUri)
    if (this.enableCaching)
      this.DownloadedFiles.set(fileUri, content);
    this.trigger("Write", file, fileUri);
    return getFileInfo(fileUri, this.dir).filePath ?? fileUri;
  }

  async allFilesInfos(recrusive?: boolean, path?: string) {
    if (!path)
      await this.checkDir();
    let fileUri = path ?? this.getName("");
    let dirs: ReadDirItem[] = [];
    dirs = await RNF.readDir(fileUri);
    console.log("getting fileInfos for ", fileUri)
    if (recrusive)
      for (let item of dirs.filter(x => x.isDirectory()))
        dirs = [...dirs, ...(await this.allFilesInfos(recrusive, item.path))]
    return dirs.filter(x => x.isFile());
  }

  async copy(source: string, des: string) {
    des = this.getName(des);
    await this.checkDir(des);
    await RNF.copyFile(source, des);
  }

  async allFiles(folder?: string) {
    let fileUri = folder ?? this.getName("");
    if (!await this.RNF.exists(fileUri))
      return [];
    let files: string[] = [];
    let dirs = await RNF.readDir(fileUri);
    for (let dir of dirs.filter(x => x.isDirectory())) {
      files = [...files, ...(await this.allFiles(dir.path))]
    }
    files = [...files, ...dirs.filter(x => x.isFile()).map(x => x.path)]
    return files;
  }

  async search(fileName: string) {
    let lst = await this.allFilesInfos(true);
    let item = lst.find(x => x.isFile() && x.name.has(fileName));
    if (item)
      return await this.read(item.path);
    return undefined;
  }

  async read(file: string, type?: EncodingType) {
    await this.checkDir();
    let text: string | undefined = undefined;
    let fileUri = this.getName(file);
    console.log("reading", fileUri);
    if (this.enableCaching && this.DownloadedFiles.has(fileUri))
      return this.DownloadedFiles.get(fileUri) as string;
    if (await this.exists(file)) {
      text = await RNFetchBlob.fs.readFile(fileUri, (type ?? "utf8") as any)
      if (this.enableCaching)
        this.DownloadedFiles.set(fileUri, text);
      return text as string;
    } else return text;
  }

  async deleteDir(folder?: string) {
    let path = this.dir;
    if (folder)
      path = path.path(folder);
    if (await RNF.exists(path)) {
      await RNF.unlink(path);
      this.trigger("onClear", folder, "", true);
    }
  }

  public async checkDir(fullPath?: string) {
    let fileInfo = getFileInfo(fullPath ?? this.dir, this.dir);
    try {
      let folders: string[] = [];

      if (fullPath)
        folders = fileInfo.folders;
      else folders.push(this.dir);
      for (let folder of folders)
        if (!await RNF.exists(folder)) {
          console.info(
            folder,
            "directory doesn't exist, creating…",
            folder
          );
          await RNF.mkdir(folder);
        }

    } catch (e) {
      console.error(e, [fileInfo].niceJson());
      throw e;
    }
  }

  onDirDelete(func: (path?: string) => void) {
    const id = useRef(newId()).current;

    this.events[id] = (op, folder) => {
      if (op == "onClear")
        func(folder);
    }

    useEffect(() => {
      return () => {
        if (this.events[id]) {
          delete this.events[id];
        }
      };
    }, [])
  }

  useFile<T extends {}>(
    globalType?: EncodingType,
    validator?: (x: any) => boolean,
    updateState?: "New" | "NewDelete"
  ) {
    const id = useRef(newId()).current;
    const files = useRef([] as string[]);
    const [fileItems, setItems] = useState<(T & { deleteFile: () => Promise<void> })[]>([]);
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
          (updateState === "New" || (updateState == "NewDelete" && op != "Delete")) && files.current.find(x => x === fileName || x == fullName)) {
          return;
        }
      }
      // await loader.show();
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
      await loader.show();
      let ims: any[] = [];
      //await setItems([]);
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
      type?: EncodingType
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
            await context.imageCache.clearImages(tm.files ?? []);
            if (tm.imagePath)
              await context.imageCache.deleteDir(tm.imagePath);
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

}


