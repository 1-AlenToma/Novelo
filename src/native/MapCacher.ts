export default class MapCacher<T> {
    item = new Map<string, T>();
    max: number;
    constructor(max: number) {
        this.max = max;
    }

    has(key: string) {
        return this.item.has(key);
    }

    get(key: string) {
        return this.item.get(key);
    }

    set(key: string, value: T) {
        this.item.set(key, value);
        if (this.item.size > this.max)
            this.item.delete(this.item.keys().next().value);
    }

    delete(key: string) {
        this.item.delete(key);
    }
}