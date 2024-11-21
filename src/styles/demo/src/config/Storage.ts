import { Platform } from "react-native";
import { globalData } from "../theme/ThemeContext";

class TempStorage {
    data: Map<string, any> = new Map();
    lastSave: number = parseInt((new Date().getTime() / 1000).toString());
    private validate() {
        let now = parseInt((new Date().getTime() / 1000).toString());
        var hours = Math.abs(now - this.lastSave) / 3600;
        if (hours > 1) {
            this.data = new Map();
            this.lastSave = parseInt((new Date().getTime() / 1000).toString());
        }

    }

    constructor() {
        globalData.tStorage = this;
    }

    getKey(key: string) {
        return `CSSStyled_${key}`;
    }

    set(key: string, item: any) {
        this.data.set(this.getKey(key), item);
    }

    delete(key: string) {
        this.data.delete(this.getKey(key));
    }

    get(key: string) {
        let value = this.data.get(this.getKey(key));
        this.validate();
        return value;
    }

    has(key: string) {
        return this.data.has(this.getKey(key));
    }

    clear() {
        this.data.clear();
    }
}

class LocalStorage {
    getKey(key: string) {
        return `CSSStyled_${key}`;
    }
    set(key: string, item: any) {
        globalData.storage.set(this.getKey(key), item);
    }

    delete(key: string) {
        globalData.storage.delete(this.getKey(key));
    }

    get(key: string) {
        let value = globalData.storage.get(this.getKey(key));
        if (value && typeof value === "string" && (value.startsWith("[") || value.startsWith("{")))
            return JSON.parse(value);
        return value;
    }

    has(key: string) {
        return globalData.storage.has(this.getKey(key));
    }

    clear() {
        globalData.storage.clear();
    }
}

export const Storage = new LocalStorage();
export const TStorage = new TempStorage();