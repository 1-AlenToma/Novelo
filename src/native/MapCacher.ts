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

    push(...items: { key, value }[]) {
        items.forEach(x => {
            this.item.set(x.key, x.value ?? this.item.get(x.key));
        })
        return this;
    }

    set(key: string, value: T) {
        this.item.set(key, value);
        if (this.item.size > this.max)
            this.item.delete(this.item.keys().next().value);
    }

    keys() {
        return Array.from(this.item.keys());
    }

    values() {
        return Array.from(this.item.values());
    }

    delete(key: string) {
        this.item.delete(key);
    }
}