import { Field, isDataField, onFieldInit, onFieldReact } from "@formily/core";
import { BUILTIN_COLOR, fillColors } from "./color";
import { ProEnumPretty } from "./pretty";

export type Value = string | number;

const safeStringify = (x: any) => {
  try {
    return JSON.stringify(x);
  } catch (error) {
    return `ERROR_STRING_ON${x?.toString()}`;
  }
};

export type ProEnumItem = {
  label: string;
  value: Value;
  disabled?: boolean;
  /** tree like */
  isLeaf?: boolean;
  children?: ProEnumItem[];
  /** lazy */
  loading?: boolean;
  /** read prettery */
  color?: keyof typeof BUILTIN_COLOR | (string & {});
};

type TItemsOrLoader =
  | ProEnumItem[]
  | ((params?: any) => Promise<ProEnumItem[]>);

type ProEnumOption = {
  mapToProp: string;
  cache?: boolean;
};

export class ProEnum {
  static from(optionsOrLoader: TItemsOrLoader, opt?: ProEnumOption) {
    return new ProEnum(optionsOrLoader, opt);
  }

  static is(x: any): x is ProEnum {
    return x instanceof ProEnum;
  }

  private pendings: Record<string, Promise<ProEnumItem[]>> = {};
  private cached: Record<string, ProEnumItem[]> = {};

  isAsync = false;
  remapPropName: string | null = null;
  options: ProEnumItem[] = [];

  constructor(optionsOrLoader: TItemsOrLoader, opt?: ProEnumOption) {
    this.remapPropName = opt?.mapToProp ?? null;
    if (typeof optionsOrLoader === "function") {
      this.isAsync = true;
      this.loader = (params?: any) => {
        const cacheKey = safeStringify(params);
        // 缓存
        if (opt?.cache !== false && this.cached[cacheKey]) {
          return Promise.resolve(this.cached[cacheKey]);
        }
        // 并发
        if (this.pendings[cacheKey] as any) return this.pendings[cacheKey];

        this.pendings[cacheKey] = optionsOrLoader(params).then((options) => {
          this.options = fillColors(options);
          this.cached[cacheKey] = this.options;
          return options;
        });
        return this.pendings[cacheKey];
      };
    } else {
      this.options = fillColors(optionsOrLoader);
    }
  }

  get emap() {
    return this.options.reduce<Map<Value, Value>>((em, item) => {
      em.set(item.value, item.label);
      em.set(item.label, item.value);
      return em;
    }, new Map());
  }

  loader(params?: any): Promise<ProEnumItem[]> {
    return Promise.resolve(this.options);
  }
}

const PRO_ENUM_KEY = "__pro_enum__";
const PRO_ENUM_HIJACK_ORIGIN_COMP_KEY = "__pro_enum_hijack_origin_comp__";
const PRO_ENUM_IN_DATA_KEY = "enum";
const LOADER_REMAP_KEY = "mapToProp";
const LOADER_PARAMS_KEY = "params";

const sameComp = (
  origin: Field["component"],
  comp: string | React.FunctionComponent<any> | Field["component"],
) => {
  const ocomp = Array.isArray(origin) ? origin[0] : origin;
  const dcomp = Array.isArray(comp) ? comp[0] : comp;
  return ocomp === dcomp;
};

export const useProEnumEffects = (opts?: {
  // 劫持 read pretty
  hijackReadPretty: boolean;
}) => {
  onFieldInit("*", (field) => {
    if (!isDataField(field)) return;
    if (!ProEnum.is(field.dataSource)) return;
    // Immediately, case by dataSource will be consumer by
    // componet, function maybe error;
    const proEnum = field.dataSource;
    field.dataSource = undefined!;

    field.setState((s) => {
      s.data = s.data ?? {};
      s.data[PRO_ENUM_KEY] = proEnum;

      const remapToProp = proEnum.remapPropName
        ? proEnum.remapPropName
        : s.data[PRO_ENUM_IN_DATA_KEY]?.[LOADER_REMAP_KEY];

      if (proEnum.isAsync && remapToProp) {
        s.componentProps = s.componentProps ?? {};
        s.componentProps[remapToProp] = proEnum.loader;
      } else if (proEnum.isAsync) {
        // auto load,
        // TODO: 需要在 fieldReact 的时候重新 autoload 吗， 我暂时认为不需要
        const params = field.data[PRO_ENUM_IN_DATA_KEY]?.[LOADER_PARAMS_KEY];
        field.loading = true;
        proEnum
          .loader(params)
          .then((options) => {
            field.dataSource = options;
          })
          .finally(() => {
            field.loading = false;
          });
      } else {
        s.dataSource = proEnum.options;
      }
    });
  });

  if (opts?.hijackReadPretty !== false) {
    onFieldReact("*", (field) => {
      if (!isDataField(field)) return;
      if (!ProEnum.is(field.data[PRO_ENUM_KEY])) return;
      if (!field.dataSource) return;
      const readPretty = field.readPretty || field.readOnly;
      if (readPretty) {
        if (!sameComp(field.component, ProEnumPretty)) {
          field.data[PRO_ENUM_HIJACK_ORIGIN_COMP_KEY] = field.component;
          field.data[PRO_ENUM_HIJACK_ORIGIN_COMP_KEY] = field.component;
          field.setComponent(ProEnumPretty);
        }
      } else if (
        field.data?.[PRO_ENUM_HIJACK_ORIGIN_COMP_KEY] &&
        !sameComp(field.data[PRO_ENUM_HIJACK_ORIGIN_COMP_KEY], field.component)
      ) {
        field.setComponent(field.data?.[PRO_ENUM_HIJACK_ORIGIN_COMP_KEY][0]);
      }
    });
  }
};
