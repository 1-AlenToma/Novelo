## Novelo

Novelo is an app that parse, download and read Novels, Manga and anime from both website.

The app is totally free, if you are a developer then feel free to participate in implementing new parser or even make improvments, simple, open an issue to review it.
<p class="flex">
<img width="24%" src="https://raw.githubusercontent.com/1-AlenToma/Novelo/main/Screenshots/Screenshot_20240225-062658_Novelo.png" />
<img width="24%"  src="https://raw.githubusercontent.com/1-AlenToma/Novelo/main/Screenshots/Screenshot_20240225-062719_Novelo.png" />
<img width="24%" src="https://raw.githubusercontent.com/1-AlenToma/Novelo/main/Screenshots/Screenshot_20240225-062742_Novelo.png" />
<img width="24%" src="https://raw.githubusercontent.com/1-AlenToma/Novelo/main/Screenshots/Screenshot_20240225-062812_Novelo.png" />
</p>

# How to make a new parser

Download the source code, and build it.

In `GlobalContext.ts` set `debugMode` to `true`. this is so you could test, add and modify the parsers and run it in developer mode.

Add new file to `parser` folder and it has to be of type `js`.

Import the new added parser to `parser/ParserWrapper` and include it to `getAllParsers`.

After you are done testing the newly added parser, set `debugMode` to `false`.

If you are using the source code in your own github then modify `libUrl` in `pages/Libraries` to your own github, otherwise open an issue and post the newly added parser there for me to review and add it.

lastly run `npm run zip`, this will create a zip file that containes all added parsers that a user could install later, then simply check in the changes to your github account.

build a new app if you have changed `libUrl` othewise simple run the app and you will find the new or modified parser there.
