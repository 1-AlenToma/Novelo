type Listener<K extends string, T extends any[] = any[]> = (key: K, ...args: T) => void | Promise<void>;

export default class EventTrigger<RETURN, K extends string> {
    private listeners = new Map<string, { keys: K[]; fn: Listener<K> }>();
    private idCounter = 0;

    get safeCounter(){
        if (this.idCounter +1 >= Number.MAX_SAFE_INTEGER)
            this.idCounter =0;
        return this.idCounter++;
    }

    /**
     * Subscribe to one or multiple keys
     */
    use<T extends any[] = any[]>(fn: Listener<K, T>, ...keys: K[]) {
        const id = `l_${this.safeCounter}`;

        this.listeners.set(id, { keys, fn });

        return () => {
            this.listeners.delete(id);
        };
    }

    compute(func: (data: RETURN) => void, ...keys: K[]) {
        const [data, setData] = useState<RETURN | undefined>();

        useEffect(() => {
            return this.use(func as any, ...keys)
        }, [])

        return data;
    }


    value(...keys: K[]) {
        let [value, setValue] = useState<RETURN>();

        useEffect(() => {
            return this.use((key, value) => {
                setValue(value);
            }, ...keys)
        }, [])

        return value;
    }

    /**
     * Trigger a single key
     */
    async trigger<T extends any[] = any[]>(key: K, ...values: T) {
        for (const { keys, fn } of this.listeners.values()) {
            if (keys.includes(key)) {
                await fn(key, ...values);
            }
        }
    }

    /**
     * Remove all listeners
     */
    clear() {
        this.listeners.clear();
    }
}