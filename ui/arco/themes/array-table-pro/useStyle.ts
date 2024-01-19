const pass = <T>(x: T) => x;
const noopStyle = (prefixCls: string) => [pass, ""] as const;
export default noopStyle;
