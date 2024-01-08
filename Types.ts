export type DataCache = {
  date: Date;
  data: any;
};

export type Button = {
  Text: Element | Function;
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
