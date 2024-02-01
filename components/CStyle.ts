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
    "bor:2 boc:#ccc bow:1 mal:5 pa:5 he:100% mih:20 wi:60 juc:center ali:center",

  "button.Text": "header bold",

  listButton:
    "di:flex bobw:1 bobc:#ccc pa:2 row ali:center he:35",

  "listButton.Icon": "fos:15 bold co:red mar:5",

  "listButton.Text": "header bold",

  box: "bor:5 wi:95% mih:200 mab:5 juc:flex-start ali:flex-start pa:5",

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
  "form.chackBox": "ali:center mar:10"
});
