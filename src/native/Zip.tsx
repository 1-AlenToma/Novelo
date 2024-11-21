import { zip, unzip, unzipAssets, subscribe } from 'react-native-zip-archive';
import RNFetchBlob from "rn-fetch-blob";
import FileHandler from './FileHandler';
import { ProgressBar } from '../components';
import * as React from "react";
import { newId } from '../Methods';
import { ZipEventData } from "../Types";


class EventTrigger<T, tKey extends string> {
    private event = new Map<string, Function>();

    private set(id: string, func: Function, ...keys: tKey[]) {
        id = keys.join(".") + id;
        this.event.set(id, func);

    }

    on(...keys: tKey[]) {
        let id = useRef(methods.newId()).current;
        let [value, setValue] = useState<T | undefined>({} as T);
        this.set(id, (v: any) => setValue(v), ...keys);

        return value;
    }

    ifTrue(keys: tKey, func: (value: any) => boolean) {
        let id = useRef(methods.newId()).current;
        const [update, setUpdate] = useState("");
        this.set(id, (v: any) => {
            if (func(v))
                setUpdate(methods.newId())
        }, ...[keys]);

        return id;
    }

    public trigger(key: tKey, value?: T) {

        for (let key of [...this.event.keys()].filter(x => x.has(key)))
            this.event.get(key)?.(value)
    }
}

export default class FilesZipper extends EventTrigger<ZipEventData, "Zip_Progress" | "CopyProgress" | "Loading"> {
    _files: string[] = [];
    _des: string = "";
    _data: { content: string; path: string }[];
    _name: string = newId() + ".zip";
    _loading: boolean = false;
    _fullPath?: string;
    subscribeEvent: { remove: () => void };
    constructor() {
        super();

        if (!fileTypes.find(x => this._name.toLocaleLowerCase().endsWith(x)))
            this._name += ".zip";
        this.subscribeEvent = subscribe(({ progress, filePath }) => {
            this.trigger("Zip_Progress", { progress, color: "red", filePath })
        });

    }

    beginNew() {
        this._data = [];
        this._files = [];
        this._name = this.fileName();
    }

    set name(value: string) {
        this._name = value;
    }

    set loading(value: boolean) {
        this._loading = value;
        this.trigger("Loading", { loading: value });
    }

    async unzip(path: string, des: string, ...dataFilesNames: string[]) {
        try {
            this._files = [];
            this._name = getFileInfo(path).name ?? this._name;
            this._data = [];
            this._des = des;
            this.loading = true;
            let handler = new FileHandler(this.tempPath());
            let desHandler = context.files.dir == des ? context.files : new FileHandler(this._des);
            await handler.checkDir(); // create the folder
            console.info("Unzipping ", path)
            await unzip(path, handler.dir);
            this._files = await handler.allFiles();

            let index = 0;
            for (let file of this._files) {
                index++;
                let fileInfo = getFileInfo(file, handler.dir);
                if (fileInfo.filePath && !dataFilesNames.find(x => fileInfo.name && fileInfo.name.has(x))) {
                    await desHandler.copy(file, des.path(fileInfo.filePath));
                }
                if (dataFilesNames.find(x => fileInfo.name?.has(x)))
                    this._data.push({ path: file, content: (await handler.read(file)) ?? "" });

                this.trigger("CopyProgress", { progress: this._files.length.procent(index), color: "green", filePath: file });
            }

            await handler.deleteDir();
            return handler;
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }


    tempPath() {
        let id = RNFetchBlob.fs.dirs.CacheDir.path(methods.newId());
        return id
    }

    fileName() {
        let id = methods.newId();
        return `${id.substring(0, id.length / 2)}_Novelo_${id.substring(id.length / 2)}.zip`
    }

    files(...files: string[]) {
        this._files = files;
        return this;
    }

    data(...data: { content: string; path: string }[]) {
        data.forEach(x => this._data.push(x))
        return this;
    }

    async zipFiles(des: string, root: string) {
        try {
            this.loading = true;
            this._des = des;
            let tPath = this.tempPath();
            let handler = new FileHandler(tPath);
            await handler.checkDir();
            let index = 0;
            for (let file of this._files) {
                index++;
                let info = getFileInfo(file, file.has(root) ? root : file.split("/").reverse().skip(0).reverse().join("/"));
                console.info("copy", file, "to", tPath.path(info.filePath ?? ""))
                await handler.copy(file, tPath.path(info.filePath ?? ""));
                this.trigger("CopyProgress", { progress: this._files.length.procent(index), color: "green", filePath: file });
            }
            for (let data of this._data) {
                index++;
                await handler.write(data.path, data.content);
                this.trigger("CopyProgress", { progress: (this._files.length + this._data.length).procent(index), color: "green", filePath: data.path });
            }
            this._fullPath = this._des.path(this._name);
            await zip(handler.dir, this._fullPath);
            await handler.deleteDir();
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }

    ProgressBar() {
        let state = context.zip.on("CopyProgress", "Zip_Progress");
        let loading = context.zip.on("Loading");


        return (
            <ProgressBar value={(state?.progress ?? .1) / 100} text={state?.filePath} color={state?.color} />
        )
    }
}