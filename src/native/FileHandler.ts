import { newId } from "../Methods";
import useLoader from "../components/Loader";
import RNF from "react-native-fs-turbo";
import { SystemDir, EncodingType, FileInfo, IReadDirItem } from "../Types";
import MapCacher from "./MapCacher";
import EventTrigger from "./EventTrigger";
import { useTimer } from "react-native-short-style";


export default class FileHandler extends EventTrigger<any, "Write" | "Delete" | "onClear" | "enabled"> {
  dir: string;
  disabled: boolean = false;
  CachesDirectoryPath: string;
  DocumentDirectoryPath: string;
  DownloadDirectoryPath: string;
  ExternalStorageDirectoryPath: string;
  RNF = RNF;
  enableCaching: boolean;
  DownloadedFiles = new MapCacher(10000);
  root: FileInfo;
  allFilesReaded: boolean = false;

  constructor(dir: string, dirType?: SystemDir, enableCaching?: boolean) {
    super()
    this.DocumentDirectoryPath = RNF.DocumentDirectoryPath;
    this.CachesDirectoryPath = RNF.CachesDirectoryPath;
    this.DownloadDirectoryPath = RNF.DownloadDirectoryPath;
    this.ExternalStorageDirectoryPath = RNF.ExternalStorageDirectoryPath;
    this.enableCaching = enableCaching || false;
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
      this.trigger("enabled", "", "", true);
    }
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

  async write(file: string, content: string | number[], options?: EncodingType) {

    let fileUri = this.getName(file);
    return methods.withLock<string>(fileUri, async () => {
      await this.checkDir(fileUri);
      console.log(
        "writing",
        fileUri,
        "filename",
        file
      );


      await RNF.writeFile(
        fileUri,
        content,
        options !== "json" ? (options ?? "utf8") : "utf8"
      );


      if (content && this.enableCaching && typeof content == "string") {
        console.info("Decoding")
        this.DownloadedFiles.set(fileUri, await content.decodeAsync());
      }
      console.log("Finished Wrting", fileUri)
      this.trigger("Write", file, fileUri);
      return getFileInfo(fileUri, this.dir).filePath ?? fileUri;
    });
  }

  async allFilesInfos(recrusive?: boolean, path?: string) {
    if (!path)
      await this.checkDir();
    let fileUri = path ?? this.getName("");
    let dirs: IReadDirItem[] = [];
    dirs = await RNF.readDir(fileUri, true);
    console.log("getting fileInfos for ", fileUri)
    if (recrusive)
      for (let item of dirs.filter(x => x.isDirectory))
        dirs = [...dirs, ...(await this.allFilesInfos(recrusive, item.path))]
    return dirs.filter(x => x.isFile);
  }

  async copy(source: string, des: string) {
    des = this.getName(des);
    await this.checkDir(des);
    if (__DEV__)
      console.log("Copy files", source, "to", des)
    if (await this.exists(des))
      await RNF.unlink(des);
    await RNF.copyFile(source, des);
    this.allFilesReaded = false;
    return des;
  }

  async allFiles(folder?: string) {
    let fileUri = folder ?? this.getName("");
    if (!await this.RNF.exists(fileUri))
      return [];
    let files: string[] = [];
    let dirs = await RNF.readDir(fileUri, true);
    for (let dir of dirs.filter(x => x.isDirectory)) {
      files = [...files, ...(await this.allFiles(dir.path))]
    }
    files = [...files, ...dirs.filter(x => x.isFile).map(x => x.path)]
    return files;
  }

  async search(fileName: string) {
    let lst = await this.allFilesInfos(true);
    let item = lst.find(x => x.isFile && x.name.has(fileName));
    if (item)
      return await this.read(item.path);
    return undefined;
  }

  async read(file: string, type?: EncodingType) {
    await this.checkDir();
    let text: string | undefined = undefined;
    let fileUri = this.getName(file);
    if (__DEV__)
      console.log("reading", fileUri);
    let dItem = this.enableCaching ? this.DownloadedFiles.get(fileUri) : undefined;
    if (dItem) {
      console.log("reading from cach", fileUri);
      return dItem as string;
    }
    if (await this.exists(file)) {
      text = (await RNF.readFile(fileUri, type != "json" ? (type ?? "utf8") : "utf8") as string);
      if (!fileUri.isImage())
        text = await text.decodeAsync();
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
          console.info("Dir created")
        }

    } catch (e) {
      console.error(e, [fileInfo].niceJson());
      throw e;
    }
  }

  onDirDelete(func: (path?: string) => void) {
    useEffect(() => {
      return this.use((op, folder) => {
        func(folder);
      }, "onClear")
    }, [func])
  }

  useFile<T extends {}>(
    globalType?: EncodingType,
    validator?: (x: any) => boolean,
    updateState?: "New" | "NewDelete"
  ) {
    const localCach = useRef(new Map<string, { changed: boolean, item: any }>()).current;
    const files = useRef([] as string[]);
    const [fileItems, setItems] = useState<(T & { deleteFile: () => Promise<void> })[]>([]);
    const loader = useLoader(true);
    const timer = useTimer(10);


    useEffect(() => {

      const getData = async (
        op: string,
        fileName?: string,
        fullName?: string,
        fromDisabled?: string
      ) => {
        timer(async () => {
          console.warn("op", op, fileName)
          if (this.disabled) {
            return;
          }

          if (fromDisabled || ["Delete", "onClear"].includes(op)) {
            if (fromDisabled || op == "onClear")
              localCach.clear();
            else {
              localCach.delete(fileName);
              localCach.delete(fullName);
            }
          }
          if (!fromDisabled) {
            if ((updateState === "New" || (updateState == "NewDelete" && op != "Delete")) && files.current.find(x => x === fileName || x == fullName)) {
              return;
            }
          }
          // await loader.show();
          if (this.allFilesReaded && this.enableCaching && !fromDisabled)
            files.current = this.DownloadedFiles.keys();
          else {
            files.current = await this.allFiles();
            if (this.enableCaching) {
              this.DownloadedFiles.push(...files.current.map(x => ({ key: this.getName(x), value: undefined })));

            }
          }

          this.allFilesReaded = true;
          if (fromDisabled)
            console.info("reloading useFiles")
          await loadItems();
        });
      }
      const off = this.use(getData, "Delete", "Write", "onClear", "enabled");
      if (!this.disabled) {
        getData(undefined)
      }

      return off;
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
      let changed = ims.length != fileItems.length;
      for (let [key, item] of localCach.entries()) {
        if (item.changed) {
          changed = true;
          item.changed = false;
        }
      }
      if (changed)
        setItems(prev => ims);
      else console.info("no changed made, skip update")
      await loader.hide();
    };

    const loadContent = async (
      file: string,
      type?: EncodingType
    ) => {
      let k = file + (type && type != "json" ? type : "utf8")
      let item = await this.read(
        file,
        type && type != "json" ? type : "utf8"
      );

      if (!item) return item;
      localCach.set(file, { item, changed: item === localCach.get(file)?.item })
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


