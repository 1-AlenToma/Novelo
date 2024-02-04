export type DataCache = {
  date: Date;
  data: any;
};

export type DownloadOptions={
  all:boolean,
  appSettings:boolean,
  epubs:boolean,
  items:{
    url:string,
    parserName: string
  }[]
}

export type Button = {
  text: Element | Function;
  press: Function;
  ifTrue: boolean;
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
export type TabChild = {
  title: string;
  icon?: TabIcon;
  head?: any; /// an element
} & ReactNode;


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