import RNF from "react-native-fs";
import FileHandler from "./FileHandler";


export default class ImageCache extends FileHandler {
  constructor(path?: string) {
    super(path ?? RNF.DocumentDirectoryPath?.path("Images") ?? "", "File", false);
  }

  async clearImages(files?: any[]) {
    if (!files)
      return;

    for (let file of files) {
      let url = this.getName(file.content);
      let fileInfo = getFileInfo(url);
      if (
        file.type == "Image" &&
        (url.startsWith("file") || url.startsWith("/"))
      ) {
       // console.info("Clearing Images", [fileInfo].niceJson());
        if (await this.RNF.exists(fileInfo.folder))
          await this.RNF.unlink(fileInfo.folder)
        // await this.delete(fileInfo.folder);
        break;
      }
    }
  }
}
