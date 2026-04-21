import IDOMParser from "advanced-html-parser";
export function generateText(html, minLength) {
    try {
        html = html.niceSentences();
        const doc = IDOMParser.parse(`<div>${html}</div>`).documentElement;
        while (true) {
            let breakIt = true;
            let headers = [
                ...doc.querySelectorAll(
                    "h1,h2,h3,h4,h5,h6"
                )
            ];

            for (let h of headers) {
                if (
                    h.textContent.indexOf("#{h0}") == -1
                ) {
                    h.textContent = `#{h0}${h.textContent
                        }#{h${h.tagName
                            .replace(/([^1-6])/g, "")
                            .trim()}}`;
                    breakIt = false;
                    break;
                }
            }
            if (breakIt) break;
        }

        const text = doc.text().replace(/\;/gim, ",");
        // console.warn(text);
        let charMap = [];

        const nextNewLine = "[(“‘".split("");
        const prevNewLine = "])”’".split("");
        const specChars = `",:?.';!()[]{}…_-`.split("");
        const possibleNewLine = [
            "level",
            " hp",
            "chapter",
            ...":-*+/%".split("")
        ];
        const meningEnd = ".!".split("");
        const invertChar = char => {
            if (nextNewLine.includes(char)) {
                return prevNewLine[nextNewLine.indexOf(char)];
            }
            if (prevNewLine.includes(char)) {
                return nextNewLine[prevNewLine.indexOf(char)];
            }
            return "";
        };
        const createMap = () => {
            for (let i = 0; i < text.length; i++) {
                let char = text.charAt(i);
                let next = text.charAt(i + 1);
                let token = invertChar(char);
                if (nextNewLine.includes(char)) {
                    charMap.push({
                        start: i,
                        charStart: char,
                        charEnd: token
                    });
                } else if (
                    prevNewLine.includes(char) &&
                    (specChars.includes(next) || [
                        " ",
                        "",
                        "\n",
                        "\r",
                        "\n\r"
                    ].includes(next))
                ) {
                    let item = charMap.find(
                        x =>
                            x.charEnd === char &&
                            x.end === undefined &&
                            i - x.start <= 310 &&
                            i - x.start >= 5
                    );

                    if (item) {
                        item.end = i;
                        item.content = text.substring(
                            item.start,
                            item.end + 1
                        );
                    }
                }
            }

            charMap = charMap.filter(
                x =>
                    x.start != undefined &&
                    x.end != undefined
            );
        };

        createMap();
        let result = [];
        let current = "";
        let index = -1;
        let currentChar = "";
        let nextChar = "";
        let prevChar = "";
        let charMapValue = [];
        let hStart = false;
        const getNextChar = () => {
            index++;
            let start = index + 1;
            let end = index;
            if (charMap.find(x => start == x.start)) {
                charMapValue = [
                    ...charMapValue,
                    ...charMap.filter(x => start == x.start)
                ];
            } else {
                charMapValue = charMapValue.filter(x => x.end != end);
            }
            prevChar = text.charAt(index - 1);
            nextChar = text.charAt(index + 1);
            return (currentChar = text.charAt(index));
        };

        const isName = () => {
            let t = '';
            for (var i = index - 5; i <= text.length; i++) {
                if (text.charAt(i)?.trim().length <= 0) continue;
                t += text.charAt(i);
                if (t.length >= 5) break;
            }
            const r = /\b(mr|Mrs|Ms|Miss|dr|Mt|dr)((\s+)?(\.)(\s+)?)/gi.test(t);
            return r;
        }

        const isNumber = () => {
            if (
                ["."].includes(currentChar) &&
                prevChar != undefined &&
                nextChar != undefined
            ) {
                let nr = prevChar + "." + nextChar;
                return /[\w]\.( )?[\w]/gim.test(nr);
            }
            return false;
        };

        const isNewLine = () => {
            let start = [index + 1];
            let end = [index, index + 1];
            if (
                charMapValue.find(x => start.includes(x.start)) ||
                (current.length > 2 && charMapValue.find(x => end.includes(x.end))) ||
                (meningEnd.includes(currentChar) && current.length >= minLength && !isNumber() && !isName()) || (possibleNewLine.find(
                    x => current.toLowerCase().includes(x.toLowerCase())) &&
                    (currentChar == "\r" || currentChar == "\n"))) {
                if (charMapValue.length <= 0 || (charMapValue.length == 1 &&
                    charMapValue.filter(x => start.includes(x.start) || end.includes(x.end)).length == 1)
                ) {
                    return true;
                }
            }
            return false;
        };

        const repeatedChar = () => {
            while (
                meningEnd.includes(nextChar) ||
                prevNewLine.includes(nextChar)
            ) {
                current += getNextChar();
            }
        };

        let addLine = () => {
            if (!hStart)
                repeatedChar();
            result.push(current.trim());
            current = "";
            hStart = false;
            // charMapValue = [];
        };

        const isHeader = () => {
            let length = "#{h0}".length;
            if (index + length >= text.length)
                return;
            let h = text.substring(
                index,
                index + length
            );

            if (h == "#{h0}" && !hStart) {
                hStart = true;
            } else if (
                hStart &&
                /\#\{h([1-6])\}/gim.test(h)
            ) {
                index += length;

                current = current.trimEnd("#") + h;

                addLine();
            }
        };
        //console.warn(text)
        while (text.length - 1 !== index) {
            isHeader();
            getNextChar();

            if (
                currentChar !== "\n" &&
                currentChar !== "\r" &&
                currentChar !== "\r\n" &&
                (current.trim().length > 0 || !".,!?…".split("").includes(currentChar))
            ) {
                if (meningEnd.includes(currentChar))
                    current = current.trim() + currentChar;
                else if (
                    currentChar != " " ||
                    !current.endsWith(" ")
                ) {
                    current += currentChar;
                }
            } else if (
                ["\n", "\r"].includes(currentChar) &&
                current.trim().length > 0
            ) {
                current = current.trim() + " ";
            }

            if (!hStart && isNewLine()) addLine();
        }

        result.push(current);

        result = result
            .filter(x =>
                /\w/gim.test(
                    x
                        .replace(/\#\{h([0-6])\}/gim, "")
                        .replace(/\_/gim, "")
                )
            )
            .map(x => {
                if (!/\#\{h([0-6])\}/gim.test(x)) {
                    let addClass =
                        nextNewLine.find(f => f == x[0]) &&
                        prevNewLine.find(
                            f => f == x[x.length - 1]
                        );
                    let className = addClass ?
                        ` class="italic"` :
                        "";

                    return `<p${className}>${x}</p>`;
                } else {
                    let tag = `h${x
                        .match(/\#\{h([1-6])\}/gim)[0]
                        .replace(/([^1-6])/g, "")
                        .trim()}`;
                    return `<${tag}>${x.replace(
                        /\#\{h([0-6])\}/gim,
                        ""
                    )}</${tag}>`;
                }
            });
        let item = "";
        index = 0;
        while (result[index]) {

            let c = result[index];

            let cleaned = c.replace(/(\<p.*?\>)|(\<\/p\>)/gim, "");
            let isItali = /class\=\"italic\"/gim.test(c);
            let length = c.length - 20;
            let n = result[index + 1];
            let prev = (item.split("\n").lastOrDefault() ?? "") as string;

            let pIsItali = /class\=\"italic\"/gim.test(prev);

            if (
                !isItali ||
                pIsItali ||
                !/\<p/gim.test(c) ||
                !/\<p/gim.test(prev) ||
                length <= 1 ||
                index < 2 ||
                possibleNewLine.find(x => x.toLowerCase().includes(prev.toLowerCase()))
            ) {
                item += `\n${c}`;
            } else if (isItali && length < 60) {
                item = `${item.substring(0, item.length - 4)} 
                ${c.replace(/\<p /gim, "<span ").replace(/\<\/p\>/gim, "</span>")}</p>`;
            } else item += `\n${c}`;
            index++;
        }

        return item;
    } catch (e) {
        console.error(e);
        throw e;
    }
}
