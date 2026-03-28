import RNF from "react-native-fs-turbo";
import FileHandler from "./FileHandler";
import ParserWrapper from "../parsers/ParserWrapper";


export default class ImageCache extends FileHandler {
  constructor(path?: string) {
    super(path ?? RNF.DocumentDirectoryPath?.path("Images") ?? "", "File", false);
  }

  async downloadImage(imgUrl: string, path: string | ParserWrapper) {
    if (typeof path == "object")
      path = path.name;
    if (!imgUrl)
      return "";
    let imgName = imgUrl.split("header")[0].trim().safeSplit("/", -1);
    if (!imgName.isImage())
      imgName += ".jpg";
    path = this.dir.join("db", path, imgName);
    console.log("fileName", getFileInfo(path, this.dir));
    let imgContent = await context.parser.current.http.imageUrlToBase64(imgUrl);
    if (imgContent && typeof imgContent == "string") {
      let data = await this.write(path, imgContent);
      console.info("image written", data)
      return data ?? path
    }

    return path;

  }

  async clearImages(files?: any[]) {
    if (!files)
      return;

    for (let file of files) {
      let url = this.getName(file.content);
      let fileInfo = getFileInfo(url);
      if (file.type == "Image" && (url.startsWith("file") || url.startsWith("/"))) {
        // console.info("Clearing Images", [fileInfo].niceJson());
        if (await this.RNF.exists(fileInfo.folder))
          await this.RNF.unlink(fileInfo.folder)
        // await this.delete(fileInfo.folder);
        break;
      }
    }
  }
}
