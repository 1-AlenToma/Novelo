// ConsoleInterceptor.ts

type ConsoleMethod = (...args: any[]) => void;

export class ConsoleInterceptor {
    private static original = {
        log: console.log as ConsoleMethod,
        info: console.info as ConsoleMethod,
        warn: console.warn as ConsoleMethod,
        error: console.error as ConsoleMethod,
    };

    private static enabled = false;

    /**
     * Apply the interception and filtering logic
     */
    static enable() {
        try {
            if (this.enabled) return;
            this.enabled = true;

            const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;

            console.log = (...args: any[]) => {
                if (isDev) this.original.log(...args);
            };

            console.info = (...args: any[]) => {
                if (isDev) this.original.info(...args);
            };

            console.warn = (...args: any[]) => {
                if (isDev) this.original.warn(...args);
            };

            console.error = (...args: any[]) => {
                // Always show errors, even in production
                this.original.error(...args);
            };

        } catch (e) {
            console.error(e)
        }
    }

    /**
     * Restore original console methods
     */
    static disable() {
        if (!this.enabled) return;
        this.enabled = false;

        console.log = this.original.log;
        console.info = this.original.info;
        console.warn = this.original.warn;
        console.error = this.original.error;
    }

    /**
     * Temporarily allow all logs (useful for debugging production)
     */
    static allowAllTemp(durationMs: number = 5000) {
        const prevDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;
        this.disable();
        setTimeout(() => {
            this.enable();
        }, durationMs);
    }
}
