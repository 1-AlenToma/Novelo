import fs from 'fs';
import path from 'path';
import ts from "typescript";
try {
    const parserPath = "./parsers";
    const des = "./temp/parsers";

    const deleteFolderRecursive = function (directoryPath) {
        if (fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach((file, index) => {
                const curPath = path.join(directoryPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    deleteFolderRecursive(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directoryPath);
        }
        fs.mkdirSync(directoryPath)
    };

    const files = fs.readdirSync(parserPath).filter(x => x.endsWith("js"));
    deleteFolderRecursive(des);
    for (let f of files) {
        const code = fs.readFileSync(path.join(parserPath, f)).toString();
        let result = ts.transpile(code.replace(/export default/gmi, ""));
        console.log("writing to", path.join(des, f))
        fs.writeFileSync(path.join(des, f), result)
    }


} catch (e) {
    console.error(e)
}