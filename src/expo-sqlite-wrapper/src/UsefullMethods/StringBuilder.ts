export default class StringBuilder {
    private text: string;
    constructor(text?: string) {
        this.text = text ?? "";
    }

    get isEmpty() {
        if (this.text.trim().length <= 0)
            return true;
        return false;
    }

    append(...texts: string[]) {
        texts.forEach(x => {
            if (x.length > 0 && !this.text.endsWith(" "))
                this.text += " ";
            this.text += x
        });

        return this;
    }

    prepend(...texts: string[]) {
        texts.forEach(x => {
            if (x.length > 0 && !this.text.startsWith(" "))
                this.text = " " + this.text;
            this.text = x + this.text
        });

        return this;
    }

    trimEnd(...q: string[]) {
        this.text = this.text.trim();
        q.forEach(x => {
            if (this.text.endsWith(x))
                this.text = this.text.substring(0, this.text.length - 1);
        })

        return this;
    }

    indexOf(search: string) {
        return this.text.indexOf(search);
    }

    replaceIndexOf(text: string, replacement: string) {
        const index = this.text.indexOf(text);
        this.text = this.text.substring(0, index) + replacement + this.text.substring(index + text.length);
        return this;
    }

    toString() {
        return this.text;
    }
}