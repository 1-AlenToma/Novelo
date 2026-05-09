export class Compressor {
    #chars = [","]
    #str = "";
    #orgin = "#";
    #letterRegex = "A-Za-z";
    #validReg = (ch) => new RegExp(
        `[${this.#letterRegex}\\-+()^~!.?&{}\\[\\]=*/;:_|$@£% ]`,
        "u"
    ).test(ch);
    #isNum = (ch) => /[0-9]+/.test(ch);
    #seperator = ",";
    #mapped = null;
    constructor(str) {
        this.#str = str;
        try {
            new RegExp("\\p{L}", "u");
            this.#letterRegex = "\\p{L}";
        } catch {
            this.#letterRegex = "A-Za-z";
        }
    }

    #getId() {
        let code = "files-assets-linker-editor";
        return this.#strToNumbers(code, "");
    }

    #strToNumbers(code, seperator = this.#orgin) {
        return code
            .split("")
            .map((_, i) => code.charCodeAt(i))
            .join(seperator);
    }

    #nrToStrings(code, seperator = this.#orgin) {
        let res = "";
        let codes = code.split(seperator).map(x => parseInt(x.trim()));
        for (let i = 0; i < codes.length; i += 10000) {
            res += String.fromCharCode(...codes.slice(i, i + 10000))
        }
        return res;
    }

    #validChars() {
        this.#str = this.#str.replace(/([0-9]+)/g, (_, n) => {
            if (!this.#chars.includes(n)) {
                this.#chars.push(n);
            }
            return this.#chars.indexOf(n).toString();
        });
        for (let s of this.#str) {
            if (this.#isNum(s)) continue;
            if (!this.#chars.includes(s) && !this.#validReg(s)) this.#chars.push(s);
        }
    }

    compress() {
        if (this.isCompressed(this.#str)) return this.#str;
        this.#validChars();
        this.#mapped = "";
        let compressed = [];
        let xIndex = 0;
        while (this.#str.charAt(xIndex)) {
            let s = this.#str.charAt(xIndex);
            if (this.#isNum(s)) {
                while (this.#isNum(this.#str.charAt(xIndex + 1))) {
                    xIndex++;
                    s += this.#str.charAt(xIndex);
                }
            }
            xIndex++;
            if (this.#isNum(s)) {
                compressed.push(s);
                continue;
            }
            let index = this.#chars.indexOf(s);
            if (index != -1) compressed.push(index);
            else compressed.push(s);
        }

        for (let x of compressed) {
            const last = this.#mapped.at(-1);
            if (this.#isNum(x) && this.#isNum(last)) {
                this.#mapped += this.#orgin;
            }
            this.#mapped += x;
        }

        this.#mapped = `${this.#mapped}${this.#seperator}${this.#strToNumbers(JSON.stringify(this.#chars))}${this.#seperator}${this.#getId()}`;
        return this.#mapped;
    }

    isCompressed(text) {
        let id = this.#getId();
        return text.endsWith(id);
    }

    deCompress() {
        let text = this.#mapped ?? this.#str;
        if (!this.isCompressed(text)) return text;
        const id = this.#getId();
        let data = text.split(this.#seperator);
        text = data[0];
        this.#chars = JSON.parse(this.#nrToStrings(data[1]));
        let reg = new RegExp(`${this.#orgin}?([0-9]+)${this.#orgin}?`, "g");
        let decompressed = text.replace(reg, (_, v) => {
            let value = this.#chars[parseInt(v.trim())];
            if (value == undefined) console.warn(v, "could not be found");
            return value;
        });
        return decompressed;
    }
}
