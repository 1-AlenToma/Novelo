import fs from 'fs';
import path from 'path';
//src\main\java\com\alentoma\Novelo
try {
    const pathToAndroidFiles = "../AndroidNativeLib";
    const nativeAndroid = "./android/app/src/main/java/com/alentoma/Novelo";
    let files = fs.readdirSync(pathToAndroidFiles);
    let nativeFiles = fs.readdirSync(nativeAndroid); 
    let appFile = undefined;

    for (let nFile of nativeFiles) {
        if (files.find(x => x == nFile))
            fs.unlinkSync(path.join(nativeAndroid, nFile)); // to update
        if (nFile == "MainApplication.kt")
            appFile = path.join(nativeAndroid, nFile);
    }
    let appFileText = appFile ? fs.readFileSync(appFile).toString() : undefined;
    let packageFile = files.find(x => x.indexOf("Package.java") != -1);

    const addString = (str) => {
        let search = "              // add(MyReactNativePackage())";
        if (str.indexOf(search) == -1)
            return str;
        const text = `                add(${packageFile.split(".")[0]}())`;
        if (str.indexOf(text.trim()) != -1)
            return str;
        let position = str.indexOf(search) + search.length
        return str.substring(0, position) + `\n${text}\n` + str.substring(position);
    }


    if (appFileText) {
        for (let file of files) {
            let txt = fs.readFileSync(path.join(pathToAndroidFiles, file)).toString();
            fs.writeFileSync(path.join(nativeAndroid, file), txt);
        }

        if (packageFile) {

            fs.writeFileSync(path.join(appFile), addString(appFileText))
        }
    }
} catch (e) {
    console.error(e);
}