import {
  View,
  Text,
  TouchableOpacity,
  SizeAnimator,
  TextInput,
  Icon,
  ActionSheetButton
} from "../components";
import * as React from "react";
import { proc } from "../Methods";
import {
  useNavigation,
  useUpdate
} from "../hooks";
import { Button } from "../Types";

export default ({
  inputEnabled,
  onInputChange,
  css,
  title,
  onBack,
  titleCss,
  buttons,
  value,
  ifTrue,
  ...props
}: {
  value?: any;
  title?: boolean;
  onInputChange?: (text: string) => void;
  inputEnabled?: boolean;
  css?: string;
  onBack?: () => boolean;
  titleCss?: string;
  buttons?: Button[];
  ifTrue?: any;
}) => {
  const [params, navOption] =
    useNavigation(props);
  const updater = useUpdate();
  context.hook(
    "KeyboardState",
    "isFullScreen"
  );
  const input = useRef();
  const state = buildState(
    {
      text: "",
      inputAnimator: {
        state: undefined
      }
    }
  ).ignore("inputAnimator").build();

  useEffect(() => {
    if (value === "") {
      state.text = "";
      input.current?.clear();
    }
  }, [value]);

  if (buttons && buttons.length > 0)
    useEffect(() => {
      updater();
    }, [...buttons]);

  context.useEffect(() => {
    updater();
  }, "appSettings");

  context.useEffect(() => {
    if (
      inputEnabled &&
      state.inputAnimator.show
    ) {
      if (context.KeyboardState)
        state.inputAnimator.show();
      else state.inputAnimator.hide();
    }
  }, "KeyboardState");
  let inputWidth = proc(
    50,
    context.size.screen?.width
  );
  return (
    <>
      <View
        ifTrue={ifTrue}
        css="clearwidth zi:101 he:40 row juc:center ali:center di:flex invert"
        style={[css?.css()]}>
        {navOption.canGoBack() ? (
          <TouchableOpacity
            css="absolute le:5"
            onPress={() => {
              if (!onBack || onBack())
                navOption.back();
            }}>
            <Icon
              type="Ionicons"
              name="caret-back-outline"
            />
          </TouchableOpacity>
        ) : null}
        {inputEnabled && onInputChange ? (
          <SizeAnimator
            blur={true}
            css="wi:50% mat:4 zi:101 clearheight juc:center maw:80%"
            refItem={state.inputAnimator}>
            <TextInput
              ref={x => {
                input.current = x;
              }}
              defaultValue={value}
              onChangeText={txt => {
                state.text = txt;
              }}
              disableFullscreenUI={true}
              enterKeyHint="search"
              inputMode="search"
              onSubmitEditing={() =>
                onInputChange(state.text)
              }
              placeholder="Search Novels"
              css="he:90% clearwidth bow:1 bor:3 desc fos:14 boc:#ccc pal:10"
              onFocus={() =>
                state.inputAnimator.show()
              }
            />
          </SizeAnimator>
        ) : inputEnabled ? (
          <TouchableOpacity
            onPress={() => {
              navOption.nav("Search").push();
            }}
            style={{
              width:
                context.parser.all().length > 1
                  ? "90%"
                  : "98%"
            }}
            css="flex absolute le:5 he:85% juc:center pal:5 bow:1 bor:3 boc:#ccc">
            <Text css="desc fos:14 invert">
              Search Novels
            </Text>
          </TouchableOpacity>
        ) : title && !title.empty() ? (
          <Text
            css={
              "header fos:18 fontStyle:italic invertco " +
              titleCss
            }>
            {title}
          </Text>
        ) : null}
        <View
          css="row juc:center ali:center absolute ri:5 bac-transparent"
          ifTrue={() =>
            buttons?.has() ??
            (false ||
              (inputEnabled && !onInputChange))
          }>
          <>
            {buttons?.map((x, i) => (
              <TouchableOpacity
                ifTrue={x.ifTrue}
                onPress={x.press}
                css="mal:10 bac-transparent"
                key={i}>
                {typeof x.text == "function"
                  ? x.text()
                  : x.text}
              </TouchableOpacity>
            ))}
            <ActionSheetButton
              ifTrue={() =>
                inputEnabled &&
                !onInputChange &&
                context.parser.all().length > 1
              }
              css="mal:10 bac-transparent"
              size="60%"
              title="Choose Parser"
              btn={
                <Icon
                  size={30}
                  type="MaterialCommunityIcons"
                  name="source-repository"
                />
              }>
              {context.parser
                .all()
                .map((x, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      context.parser.set(x)
                    }
                    css={`listButton pal:5 invert ${x.name ===
                      context.parser.current.name
                      ? "selectedRow bor:5"
                      : ""
                      }`}>
                    <Text css="fow:bold invertco">
                      {x.name} ({x.type})
                    </Text>
                  </TouchableOpacity>
                ))}
            </ActionSheetButton>
          </>
        </View>
      </View>
      {state.inputAnimator.state &&
        context.KeyboardState ? (
        <TouchableOpacity
          ifTrue={ifTrue}
          onPress={() => input.current.blur()}
          css="absolute to:0 le:0 flex clearboth zi:100 blur"
        />
      ) : null}
    </>
  );
};
