


export const useParser = (parserName?: string) => {
    const parser = useRef(context.parser.clone(parserName ?? context.parser.current.name));
    context.useEffect(() => {
        parser.current?.dispose();
        parser.current = context.parser.clone(parserName ?? context.parser.current.name);
    }, "parser.all");

    useEffect(() => {
        return () => {
            parser.current.dispose();
        }
    }, [])
    return parser.current;
}