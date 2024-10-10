export default (onUpdate?: Function) => {
  const [id, setId] = useState("");
  const update = () => {
    setId(methods.newId());
  };

  useEffect(() => {
    onUpdate?.();
  }, [id]);

  return () => update();
};
