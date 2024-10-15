

import "../Global"
test("test getFileIngo").run(() => {
    let url = "/Storage/emulator/0/images/test.json"
    let dir = "/Storage/emulator/0/";

    return getFileInfo(url, dir)
}).eq({
    "path": "/Storage/emulator/0/images/test.json",
    "folders": [
        "/Storage/emulator/0/images/"
    ],
    "folder": "/images",
    "filePath": "images/test.json",
    "name": "test.json"
});


test("test getFileIngo 2").run(() => {
    let url = "/Storage/emulator/0/images/Pic/test.json"
    let dir = "/Storage/emulator/0/";

    return getFileInfo(url, dir)
}).eq({
    "path": "/Storage/emulator/0/images/Pic/test.json",
    "folders": [
        "/Storage/emulator/0/images/",
        "/Storage/emulator/0/images/Pic/"
    ],
    "folder": "/images/Pic",
    "filePath": "images/Pic/test.json",
    "name": "test.json"
});


test("test getFileIngo 3").run(() => {
    let url = "/Storage/emulator/0/images/Pic/test.json"
    let dir = undefined;

    return getFileInfo(url, dir)
}).eq({
    "path": "/Storage/emulator/0/images/Pic/test.json",
    "folders": [
        "/Storage",
        "/Storage/emulator/",
        "/Storage/emulator/0/",
        "/Storage/emulator/0/images/",
        "/Storage/emulator/0/images/Pic/"
    ],
    "folder": "/Storage/emulator/0/images/Pic",
    "filePath": "test.json",
    "name": "test.json"
});


