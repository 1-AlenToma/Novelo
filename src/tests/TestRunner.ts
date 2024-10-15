export default class TestRunner {
    desc: string;
    func?: Function;
    exp?: string;
    value: string = "";
    constructor(desc: string) {
        this.desc = desc;
    }

    error(a, b) {
        console.error("Error", [a].niceJson(), this.exp, [b].niceJson());
    }

    info(a, b) {
        console.error("Info", [a].niceJson(), this.exp, [b].niceJson());
    }

    pass() {
        console.info(this.desc, "pass")
    }

    async execute() {

        try {
            let item = await this.func?.();
            let a = JSON.stringify(item, undefined, 4);
            let b = JSON.stringify(this.value, undefined, 4);
            let exp1 = a.replace(/\r?\n|\r| |/gim, "");
            let exp2 = b.replace(/\r?\n|\r| |/gim, "");
            switch (this.exp) {
                case "==":
                    if (!(exp1 == exp2))
                        this.error(item, this.value);
                    else this.pass()
                    break;
                case "!==":
                    if (!(exp1 !== exp2))
                        this.error(item, this.value);
                    else this.pass()
                    break;
                case ">=":
                    if (!(item >= this.value))
                        this.error(item, this.value);
                    else this.pass()
                    break;
                case "<=":
                    if (!(item <= this.value))
                        this.error(item, this.value);
                    else this.pass()
                    break;
                case ">":
                    if (!(item > this.value))
                        this.error(item, this.value);
                    else this.pass()
                    break;
                case "<":
                    if (!(item < this.value))
                        this.error(item, this.value);
                    else this.pass()
                    break;
                case undefined:
                    this.info(item, this.value);
                    break;




            }
        } catch (e) {
            console.error(this.desc, e);
        }
    }

    exec() {
        this.execute();
    }

    run(func: Function) {
        this.func = func;
        return this;
    }

    eq(item: any) {
        this.exp = "==";
        this.value = item;
        return this;
    }

    notEq(item: any) {
        this.exp = "!==";
        this.value = item;
        return this;
    }

    greaterOrEq(item: any) {
        this.exp = ">=";
        this.value = item;
        return this;
    }

    lessOrEq(item: any) {
        this.exp = "<=";
        this.value = item;
        return this;
    }

    greater(item: any) {
        this.exp = ">";
        this.value = item;
        return this;
    }

    less(item: any) {
        this.exp = "<";
        this.value = item;
        return this;
    }
}