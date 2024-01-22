export const omit = <T extends object, K extends keyof T>(
  o: T,
  ...keys: K[]
) => {
  if (typeof o !== "object") return o;
  return Object.keys(o).reduce((p, k: string) => {
    if (!keys.includes(k as any)) {
      (p as any)[k] = (o as any)[k];
    }
    return p;
  }, {} as T);
};

export const pick = <T extends object, K extends keyof T>(
  o: T,
  ...keys: K[]
) => {
  if (typeof o !== "object") return o;
  return Object.keys(o).reduce(
    (p, k: string) => {
      if (keys.includes(k as any)) {
        (p as any)[k] = (o as any)[k];
      }
      return p;
    },
    {} as T,
    //  {
    //   // 不太好用, 晚点练习一下类型体操吧
    //   // https://github.com/ascoders/weekly/blob/master/TS%20%E7%B1%BB%E5%9E%8B%E4%BD%93%E6%93%8D/243.%E7%B2%BE%E8%AF%BB%E3%80%8APick%2C%20Awaited%2C%20If...%E3%80%8B.md
    //   [Key in K]: T[K];
    // },
  );
};
