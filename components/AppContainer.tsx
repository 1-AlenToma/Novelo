import {
  createContext,
  useEffect,
  useRef,
  useContext,
  useState
} from "react";
import { newId } from "../Methods";
import View from "./ThemeView";
import Text from "./ThemeText";
import {useUpdate} from "../hooks"

const ElementsContext = createContext({});
const AppContainer = ({
  children
}: {
  children: any;
}) => {
  const [isReady, setIsReady] = useState(false);
  const data = {
    items: new Map(),
    update: () => {},
    newKey: () => {},
    find: (id: string) => {
      return data.items.get(id);
    },
    has: (id: string) => data.items.has(id),
    remove: (id: string) => {
      data.items.delete(id);
    },
    updateProps: (
      elem: any,
      id: string,
      props: any
    ) => {
      data.items.set(id, { props, elem });
      // if (item) item.component.props = props;
    },
    setIsReady: setIsReady,
    push: (elem: any, id: string, props: any) => {
      //alert(id);
      data.items.set(id, { elem, props });
    }
  };

  useEffect(() => {
    return () => {
      data.items.clear();
      data.update();
    };
  }, []);

  return (
    <ElementsContext.Provider value={data}>
      <>
        <View css="zi:1 flex">
          {isReady ? children : null}
        </View>
        <AppChildContainer />
      </>
    </ElementsContext.Provider>
  );
};

const AppChildContainer = () => {
  const updater = useUpdate();
  const [items] = useState(
    new Map<string, Item>()
  );
  const [kk, setK] = useState("12");
  const context = useContext(ElementsContext);
  context.update = () => {
    updater();
  };
  context.newKey = () => {
    setK(newId());
  };
  useEffect(() => {
    context.setIsReady(true);
  }, []);
  context.items = items;
  const rItem = [];
  items.forEach((x, k) => {
    rItem.push({ x, k });
  });

  return (
    <>
      {rItem.map((x, i) => (
        <View
          style={{ zIndex: 9999 + i }}
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
