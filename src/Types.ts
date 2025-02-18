import { ReactElement, ReactNode } from "react";
import {
  Player,
  BGService,
  FileHandler,
  HttpHandler,
  ImageCache,
  FilesZipper,
  Notification
} from "./native";
import { AppSettings, TableNames } from "./db";
import ParserWrapper from "./parsers/ParserWrapper";
import DownloadManager from "./native/DownloadManager";
import * as Speech from 'expo-speech';
import DbContext from "./db/dbContext";

import createDbContext, {
  IDatabase,
  IQueryResultItem,
  IBaseModule,
  encrypt,
  decrypt,
  TableBuilder
} from "./expo-sqlite-wrapper/src";
import { ReadDirItem } from "react-native-fs";



export type FileInfo = {
  name?: string;
  folders: string[];
  folder: string;
  filePath?: string;
  path: string;
}

export type NotificationData = {
  data: any,
  type: "File" | "Story"
}

export type ZipEventData = { progress?: number, color?: string, filePath?: string, loading?: boolean }
export type SystemDir = "Cache" | "File";
export type EncodingType = "json" | "utf8" | "base64";
export type FileFnc = (
  type: "Write" | "Delete",
  file: string
) => void;

export type IImage = {
  src: string;
  id: string;
}

export type SelectionType = "Folder" | "File";

export type EXT = "json" | "txt" | "epub" | "zip";

export const FilesPath = {
  File: "noveloFiles",
  Cache: "Memo",
  Images: "Images",
  Private: "Private"
}

export type NovelFile = {
  fileName: string,
  type: string,
  content: string
}

export const OmitType = <T, K extends keyof T>(Class: new () => T, ...keys: K[]): new () => Omit<T, typeof keys[number]> => Class;




export abstract class DBInit extends IBaseModule<TableNames> {
  static n() {
    return {} as any;
  };
  //  this will be assigned by the db
  async saveChanges() {

  }

  async update(...keys: string[]) {

  }

}

type NestedKeyOf<T extends object, D extends any[] = [0, 0, 0, 0, 0]> = D extends [any, ...infer DD] ? {
  [K in keyof T & (string | number)]: T[K] extends object ? `${K}` | `${K}.${NestedKeyOf<T[K], DD>}` : `${K}`;
}[keyof T & (string | number)] : never;
type ReturnState<T extends object> = {
  hook(...keys: NestedKeyOf<T>[]): void;
  useEffect(fn: Function, ...keys: NestedKeyOf<T>[]): void;
  bind(path: string): void;
};

type ThemeMode = "light" | "dark";
export type ISize = { height: number, width: number }
export type GlobalType =
  {
    lineHeight: number;
    selectedFoldItem: string;
    panEnabled: boolean;
    zip: FilesZipper,
    notification: Notification,
    browser: {
      data?: { func: Function, onCancel: (value?: any) => void, desc?: string, props: { selectionType: SelectionType, ext?: EXT[] } };
      pickFile: (eXT: EXT[], desc?: string) => Promise<ReadDirItem | undefined>;
      pickFolder: (desc?: string) => Promise<ReadDirItem | undefined>;
    },
    selection: {
      downloadSelectedItem: any,
      favoritItem: any
    },
    alertMessage: {
      msg: any;
      title: string;
      confirm?: (answer: boolean) => any;
      toast?: boolean
    };
    novelFavoritInfo: any,
    player: Player,
    http: () => HttpHandler,
    downloadManager: () => DownloadManager,
    KeyboardState: boolean,
    isFullScreen: boolean,
    appSettings: AppSettings,
    voices: undefined | Speech.Voice[],
    cache: FileHandler,
    files: FileHandler,
    imageCache: ImageCache,
    speech: typeof Speech,
    nav: any,
    orientation: (value: "Default" | "LANDSCAPE") => void,
    parser: {
      current: ParserWrapper,
      find: (name: string) => ParserWrapper,
      set: (p: any) => Promise<void>,
      all: () => ParserWrapper[],
    },
    updater: string,
    selectedThemeIndex: number,
    dbContext: () => DbContext,
    db: () => IDatabase<TableNames>,
    size: {
      window: ISize,
      screen: ISize
    },
    init: () => Promise<{ remove: Function }[]>

  }

export type IGlobalState = GlobalType & ReturnState<GlobalType>

export type DataCache = {
  date: Date;
  data: any;
};

export type DownloadOptions = {
  all: boolean,
  appSettings: boolean,
  epubs: boolean,
  items: {
    url: string,
    parserName: string
  }[]
}

export type Button = {
  text: ReactElement<any, any> | Function;
  press?: Function;
  ifTrue?: boolean;
};

export type IStorage = {
  set: (
    file: string,
    value: DataCache
  ) => Promise<void>;
  get: (
    file: string
  ) => Promise<DataCache | null>;
  has: (file: string) => Promise<boolean>;
  delete: (...files: string[]) => Promise<void>;
  getFiles: (
  ) => Promise<readonly string[]>;
};

export type MemorizeOptions = {
  isDebug?: boolean;
  storage?: IStorage;
  daysToSave: number;
  argsOverride?: (...args: any[]) => any[];
  updateIfTrue?: (args: any) => boolean;
  keyModifier?: (
    target: any,
    key: string
  ) => string;
  validator?: (params: any) => boolean;
};

export type TabIcon = {
  name: string;
  type: string;
};
export interface TabChild extends ReactElement {
  title?: string;
  icon?: TabIcon;
  head?: any; /// an element
}

export interface Parameter {
  name: string;
  value: string;
}

export interface EpubChapter {
  fileName?: string; // use title when is not set
  title: string;
  htmlBody: string;
  parameter?: Parameter[];
}

export interface File {
  path: string;
  content: string;
}


export interface EpubSettings {
  fileName?: string; // use title when is not set
  title: string;
  language?: string; // Default en
  bookId?: string;
  description?: string;
  source?: string;
  author?: string;
  chapters: EpubChapter[];
  stylesheet?: any;
  parameter?: Parameter[];
}