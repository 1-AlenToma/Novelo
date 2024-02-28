import { NestedStyleSheet } from "../styles";
export default NestedStyleSheet.create({
  desc: {
    fontSize: 10
  },

  header: {
    fontSize: 13
  },

  bold: {
    fontWeight: "bold"
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

  button:
    "di:flex pa:2 row ali:center he:35 miw:55",

  "button.Icon": "fos:30 bold co:red mar:5",

  "button.Text": "header bold",

  listButton:
    "di:flex bobw:1 bobc:#ccc pa:2 row ali:center he:35",

  "listButton.Icon": "fos:15 bold co:red mar:5",

  "listButton.Text": "header bold",

  settingButton: "listButton pa:5 wi:100%",

  "settingButton.Icon": "fos:25 mar:5",

  box: "bor:5 wi:95% mih:200 mab:5 juc:flex-start ali:flex-start pa:5",
  selectedRow: "bac:#5a1c1f",
  selected: {
    opacity: 0.8,
    color: "gray"
  },
  "selected.Text": {
    color: "red"
  },
  Slider: "clearboth",
  band: "clearwidth absolute he:50 zi:100 di:flex",
  form: "clearwidth row di:flex jus:space-between ali:center mab:5",
  "form.Text":
    "fos:13 bold tea:left par:10 wi:100",
  "formlist.Text": "wi:90%",
  "form.chackBox": "ali:center mar:10",

  formRow:
    "clearwidth mab:5",
  "formRow.Text":
    "fos:13 bold tea:left par:10 wi:100",
  "formRow.chackBox": "ali:center mar:10"
});
