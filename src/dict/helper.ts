import { ColorsKey, colorByStatus, colors } from "./colors";

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
    key?: string | number;
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
import type { Form } from "@formily/core";
import { onFieldMount, onFieldReact } from "@formily/core";
import { model } from "@formily/reactive";
import type React from "react";
import { Dict } from "./index";

export type TDictLoaderFactory = () => Promise<TDictShape["options"]>;

export const memo: Record<string, TDictShape> = model({});

export const dict = memo;

const loaders: Record<string, () => Promise<TDictShape>> = {};

const pendings: Record<string, Promise<TDictShape> | undefined> = {};

/**
 *
@example
const boolLoader = (conver) => () => {
  return Promise.resolve([
    { name: '是', code: 1, color: 'success' },
    { name: '否', code: 0, color: 'error' },
  ]).then(data => convert(data, 'name', 'code'));
};
registerDictLoader('bool', boolLoader);

 */

export const registerDictLoader = (
  name: string,
  loaderFactory: TDictLoaderFactory,
) => {
  loaders[name] = () => {
    return loaderFactory().then((list) => {
      const mydict = listToDict(list);
      memo[name] = mydict;
      console.log("🚀 ~ returnloaderFactory ~ memo[name:", name, memo[name]);
      return memo[name];
    });
  };
};

export const dictEffects = (form: Form) => {
  onFieldMount("*", (field) => {
    const maybe = field.data?.dict;
    if (!maybe) return;
    const noCache = field.data.dictNoCache;

    if (!memo[maybe] && !loaders[maybe]) {
      throw new Error(`词典 ${maybe} 的加载器不存在!`);
    }

    if (noCache !== true && memo[maybe]) {
      field.setState((s) => {
        s.dataSource = memo[maybe].options;
        if (s.componentProps) {
          s.componentProps.options = s.dataSource;
        }
      });
    } else if (maybe && loaders[maybe]) {
      field.setState((s) => {
        s.loading = true;
      });

      const task = pendings[maybe] || loaders[maybe]();

      pendings[maybe] = task
        .then((mydict) => {
          field.setState((s) => {
            s.dataSource = mydict.options;
            if (s.componentProps) {
              s.componentProps.options = s.dataSource;
            }
            s.loading = false;
          });
          return mydict;
        })
        .catch((e) => {
          field.setState((s) => {
            s.loading = false;
          });
          throw e;
        });
    }
  });

  onFieldReact("*", (field) => {
    const maybe = field.data?.dict;
    if (!maybe) return;

    const same = (
      origin: typeof field.component,
      comp: string | React.FunctionComponent<any> | typeof field.component,
    ) => {
      const ocomp = Array.isArray(origin) ? origin[0] : origin;
      const dcomp = Array.isArray(comp) ? comp[0] : comp;
      return ocomp === dcomp;
    };

    const readPretty = field.readPretty || field.readOnly;
    if (readPretty) {
      if (!same(field.component, Dict)) {
        field.data.__origin_component = field.component;
        field.setComponent(Dict);
      }
    } else if (
      field.data?.__origin_component &&
      !same(field.data.__origin_component, field.component)
    ) {
      field.setComponent(field.data.__origin_component);
    }
  });
};
