import { NestedStyleSheet } from ".";
const font = "SourceSans3-Bold";
const font0 = "SourceSans3-BlackItalic";
export default NestedStyleSheet.create({
    desc: {
        fontSize: 10,
        fontFamily: font0
    },

    header: {
        fontSize: 14,
        fontFamily: font
    },

    clearboth: {
        width: "100%",
        height: "100%"
    },

    clearwidth: {
        width: "100%"
    },

    clearheight: {
        height: "100%"
    },

    relative: {
        position: "relative"
    },

    absolute: {
        position: "absolute"
    },

    row: {
        flexDirection: "row"
    },

    flex: {
        flex: 1
    },

    bottom: {
        position: "absolute",
        bottom: 0
    },

    blur: {
        opacity: 0.7,
        backgroundColor: "#000000"
    },

    overflow: {
        overflow: "hidden"
    },

    hidden: {
        display: "none"
    },

    fileButton: "di:flex row pa:5 bow:0.4 boc:gray juc:center ali:center mar:5 he:90%",

    "fileButton.Icon": "desc fos:30 co:red mar:5",

    "fileButton.Text": "desc fos:12",

    button: "di:flex pa:2 row ali:center he:35 miw:55",

    "button.Icon": "desc fos:30 co:red mar:5",

    "button.Text": "desc fos:14",

    borderBottom: "bobw:1 bobc:#ccc",

    borderTop: "botw:1 botc:#ccc",

    listButton:
        "di:flex borderBottom pa:2 row ali:center mih:48",

    "listButton.Icon": "fos:15 bold mar:5",

    "listButton.Text": "desc fos:13",

    settingButton: "listButton pa:0 par:5 wi:100% ali:center",

    "settingButton.Icon": "mal:5 fos:25 mar:5",

    "settingButton.Text": "pa:5 maw:90%",

    box: "bor:5 wi:95% mih:200 mab:5 juc:flex-start ali:flex-start pa:5",
    selectedRow: "bac:#e5313a",
    "selectedRow.Text": "co:white",
    selected: {
        opacity: 0.8,
        color: "gray"
    },
    "selected.Text": {
        color: "red"
    },
    Slider: "clearboth",
    band: "clearwidth absolute he:50 zi:100 di:flex",
    form: "clearwidth row di:flex juc:space-between ali:center mab:5",
    "form.Text":
        "desc fos:13 tea:left par:10 wi:130",
    "formlist.Text": "wi:90%",
    "form.chackBox": "ali:center mar:10",

    formRow: "clearwidth mab:5",
    "formRow.Text": "desc fos:13 tea:left par:10 wi:100",
    "formRow.chackBox": "ali:center mar:10"
});
