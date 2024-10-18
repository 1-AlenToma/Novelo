import { sleep } from "../Methods"
export default class MapCacher<T> {
    item = new Map<string, T>();
    max: number;
    min: number;
    locked = false;
    constructor(max: number, min: number) {
        this.max = max;
        this.min = min;
    }

    has(key: string) {
        return this.item.has(key);
    }

    get(key: string) {
        return this.item.get(key);
    }

    set(key: string, value: T) {
        this.item.set(key, value);
        this.validate();

    }

    delete(key: string) {
        this.item.delete(key);
    }

    async validate() {
        if (this.locked)
            return;
        this.locked = true;
        if (this.item.size >= this.max) {
            let keys = [...this.item.keys()]
            while (keys.length > this.min) {
                this.item.delete(keys.shift() as string);
                await sleep(10);
            }
        }
        this.locked = false;
    }
}