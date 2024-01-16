import type { Form } from "@formily/core";
import { onFieldMount, onFieldReact } from "@formily/core";
import { observable } from "@formily/reactive";
import type React from "react";
import { TDictShape, convertListToDict, convertToOptionList } from "../shared";
import { Dict } from "./index";

export type TDictLoaderFactory = (
  converter: typeof convertToOptionList,
) => Promise<ReturnType<typeof convertToOptionList>>;

export const memo: Record<string, TDictShape> = observable({});

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
    return loaderFactory(convertToOptionList).then((list) => {
      const mydict = convertListToDict(list);
      memo[name] = mydict;
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
