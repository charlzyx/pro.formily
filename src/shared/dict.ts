import { ColorsKey, colors } from "./colors";

export type TDictShape = {
  emap: {
    [x: string]: string | number;
    [x: number]: string | number;
  };
  colors: {
    [x: string]: string;
    [x: number]: string;
  };
  options: {
    key: string | number;
    label: string;
    value: number | string;
    color?: ColorsKey;
  }[];
};

export type TDictItem = Omit<TDictShape["options"][0], "key">;

const getColorByIdx = (idx: number) =>
  colors[(idx % colors.length) as keyof typeof colors];

export const listToDict = (list: TDictItem[] = []): TDictShape => {
  const dict = {
    emap: list.reduce((ret: any, cur: any) => {
      ret[cur.value] = cur.label;
      ret[cur.label] = cur.value;
      return ret;
    }, {}),
    colors: list.reduce((ret: any, cur: any, idx) => {
      const color = cur.color || getColorByIdx(idx);
      ret[cur.value] = color;
      ret[cur.label] = color;
      return ret;
    }, {}),
    options: list.map((x, idx) => ({
      ...x,
      key: x.value,
      color: x.color || (getColorByIdx(idx) as ColorsKey),
    })),
  };
  return dict;
};

export const convertToOptionList = <Row extends object>(
  list: Row[],
  labelName: keyof Row = "label" as any,
  valueName: keyof Row = "value" as any,
) => {
  return list.map((x: any) => {
    return {
      key: x[valueName as string],
      label: x[labelName as string],
      value: x[valueName as string],
      color: x.color,
    };
  });
};

export const convertListToDict = <Row extends object>(
  list: Row[],
  labelName: keyof Row = "label" as any,
  valueName: keyof Row = "value" as any,
) => {
  return listToDict(
    list.map((x: any) => {
      return {
        key: x[valueName as string],
        label: x[labelName as string],
        value: x[valueName as string],
        color: x.color,
      };
    }),
  );
};
