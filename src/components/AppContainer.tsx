import {
  createContext,
  useContext
} from "react";
import * as React from "react";
import { newId } from "../Methods";
import { View } from "./ReactNativeComponents";
import { useUpdate, useTimer } from "../hooks";
import { ISize } from "Types";

const ElementsContext = createContext({});
let zindex = 1;
const AppContainer = ({
  children
}: {
  children: any;
}) => {
  const [isReady, setIsReady] = useState(false);
  const [items] = useState(new Map());
  const containerSize = useRef<ISize>(context.size.window)
  const data = {
    items,
    update: () => { },
    newKey: () => { },
    find: (id: string) => {
      return data.items.get(id);
    },
    has: (id: string) => items.has(id),
    remove: (id: string) => {
      items.delete(id);
    },
    containerSize: () => containerSize.current,
    zIndex: () => zindex++,
    updateProps: (
      elem: any,
      id: string,
      props: any,
      zIndex?: number
    ) => {
      items.set(id, {
        elem,
        props
      });
      data.update();
    },
    setIsReady: setIsReady,
    push: (elem: any, id: string, props: any) => {
      items.set(id, {
        elem,
        props
      });
      data.update();
    }
  };

  useEffect(() => {
    return () => {
      items.clear();
      data.update();
    };
  }, []);

  return (
    <ElementsContext.Provider value={data}>
      <>
        <View
          onLayout={({ nativeEvent }) => {
            containerSize.current = nativeEvent.layout
          }}
          css="zi:1 flex"
          onStartShouldSetResponderCapture={() =>
            false
          }>
          {isReady ? children : null}
        </View>
        <AppChildContainer />
      </>
    </ElementsContext.Provider>
  );
};

const AppChildContainer = () => {
  const updater = useUpdate();
  const time = useTimer(10);
  const [kk, setK] = useState("12");
  const appContext = useContext(ElementsContext) as any;
  appContext.update = () => {
    updater();
  };

  appContext.newKey = () => {
    setK(newId());
  };
  useEffect(() => {
    appContext.setIsReady(true);
  }, []);
  let items = appContext.items;
  let rItem: any[] = [];
  items.forEach((x, k) => {
    rItem.push({ x, k });
  });

  rItem = rItem.sort((a, b) => {
    let av = a.x.props.toTop ?? false;
    let bv = b.x.props.toTop ?? false;
    return av === bv ? 0 : av ? 1 : -1;
  });
  return (
    <>
      {rItem.map((x, i) => (
        <View
          style={{
            zIndex:
              200 +
              (x.x.props.toTop == true ? 10 : 0)
          }}
          ifTrue={x.x.props.visible}
          css="bac:transparent bottom clearboth"
          key={x.k + kk}>
          {x.x.elem}
        </View>
      ))}
    </>
  );
};

export { AppContainer, ElementsContext };
