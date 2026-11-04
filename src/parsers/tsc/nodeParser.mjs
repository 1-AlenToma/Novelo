import fs from 'fs';
import path from 'path';
import ts from "typescript";

try {
    const parserPath = "./parsers";
    const des = "./temp/parsers";

    const deleteFolderRecursive = function (directoryPath) {
        if (fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach((file) => {
                const curPath = path.join(directoryPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directoryPath);
        }
        fs.mkdirSync(directoryPath);
    };

    // Filter files (supports both .ts and .js source folders)
    const files = fs.readdirSync(parserPath).filter(x => x.endsWith(".js") || x.endsWith(".ts"));
    deleteFolderRecursive(des);

    for (let f of files) {
        const code = fs.readFileSync(path.join(parserPath, f)).toString();

        // Clean out your custom default exports structure
        const cleanedCode = code.replace(/export default/gmi, "");

        // FORCE TARGET ES5: This outputs the exact __extends, __awaiter, and __generator boilerplate
        const transpileResult = ts.transpileModule(cleanedCode, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,   // Keeps native 'class' and 'extends' blocks intact
                module: 0,       // Keeps cleanly formatted browser strings
                removeComments: true
            }
        });

        const result = transpileResult.outputText;

        // Output filenames strictly to standard JavaScript (.js)
        const outputFilename = f.replace(/\.ts$/, '.js');
        console.log("writing to", path.join(des, outputFilename));

        fs.writeFileSync(path.join(des, outputFilename), result);
    }

} catch (e) {
    console.error(e);
}
