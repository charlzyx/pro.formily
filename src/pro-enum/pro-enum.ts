import { Field, isDataField, onFieldInit, onFieldReact } from "@formily/core";
import { BUILTIN_COLOR, fillColors } from "./color";
import { ProEnumPretty } from "./pretty";
import { isLabelInValue } from "../shared";

const safeStringify = (x: any) => {
  try {
    return JSON.stringify(x);
  } catch (error) {
    return `${Date.now()}_ERROR_STRINGIFY_ON_${x?.toString()}`;
  }
};

const waiting = (ms: number, cb: () => boolean) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const ok = cb();
      if (ok) {
        resolve();
      } else {
        reject();
      }
    }, ms);
  });

export type Value = string | number;

export type ProEnumItem = {
  label: string;
  value: Value;
  disabled?: boolean;
  /** tree like */
  isLeaf?: boolean;
  children?: ProEnumItem[];
  /** lazy */
  loading?: boolean;
  /** read pretty */
  color?: keyof typeof BUILTIN_COLOR | (string & {});
};

type TItemsOrLoader =
  | ProEnumItem[]
  | ((params?: any) => Promise<ProEnumItem[]>);

/**
 * @example
 * {
 *  type: 'string',
 *  enum: ProEnum.from([]),
 *  "x-component-props": {
 *     enum: {
 *       hijack: false,
 *     }
 *  }
 * }
 */
type ProEnumSchemaOption = Pick<ProEnumOption, "mapToProp"> & {
  pretty?: boolean;
  showType?: React.ComponentProps<typeof ProEnumPretty>["showType"];
  strict?: React.ComponentProps<typeof ProEnumPretty>["strictMode"];
  // 额外的请求参数
  params?: any;
};
type ProEnumOption = {
  mapToProp?: string;
  cache?: boolean;
  // > 0 启用
  debounce?: number;
  lazyTree?: boolean;
  colorful?: boolean;
  // 是否劫持 read pretty
  pretty?: boolean;
};

export const parseLazyParams = (params: any) => {
  const values = Array.isArray(params)
    ? params.map((item: any) => (isLabelInValue(item) ? item.value : item))
    : params;
  return values;
};

export const buildTree = (
  values: Value[],
  dataSource: ProEnumItem[],
  neo: ProEnumItem[] = [],
) => {
  const parent = Array.isArray(values)
    ? values.reduce<ProEnumItem | ProEnumItem[]>((children: any, val, idx) => {
        // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
        const parent = children?.find?.((x: any) => x.value == val);
        const isLast = idx === values.length - 1;

        return isLast ? parent : parent?.children;
      }, dataSource as any)
    : null;
  if (parent === dataSource) {
    return neo;
  } else if (parent) {
    (parent as ProEnumItem).children = neo;
  }
  return dataSource;
};

export class ProEnum {
  static from(itemsOrLoader: TItemsOrLoader, opt?: ProEnumOption) {
    return new ProEnum(itemsOrLoader, opt);
  }

  static is(x: any): x is ProEnum {
    return x instanceof ProEnum;
  }

  private pendings: Record<string, Promise<ProEnumItem[]>> = {};
  private cached: Record<string, ProEnumItem[]> = {};
  private rank = 0;
  private events = {
    id: 0,
    map: {} as Record<string, any>,
  };

  private isLazyTree = false;
  private setDataSource(neo: ProEnumItem[], params?: any) {
    if (this.isLazyTree) {
      const values = parseLazyParams(params);

      this.dataSource = buildTree(values, this.dataSource, neo);
    } else {
      this.dataSource = neo;
    }

    Object.values(this.events.map).forEach((cb) => {
      cb(this.dataSource);
    });
  }

  isAsync = false;
  pretty = true;
  mapToProp: string | null = null;
  dataSource: ProEnumItem[] = [];

  constructor(itemsOrLoader: TItemsOrLoader, opt?: ProEnumOption) {
    this.mapToProp = opt?.mapToProp ?? null;
    this.isLazyTree = Boolean(opt?.lazyTree);
    this.pretty = opt?.pretty ?? true;
    if (typeof itemsOrLoader === "function") {
      this.isAsync = true;
      const loadData = itemsOrLoader;
      const proEnumLoader = (params?: any) => {
        const cacheKey = safeStringify(params);
        // 缓存
        if (opt?.cache !== false && this.cached[cacheKey]) {
          return Promise.resolve(this.cached[cacheKey]);
        }
        // 并发, 和防抖 debounce 不能共存
        if (!opt?.debounce && (this.pendings[cacheKey] as any))
          return this.pendings[cacheKey];

        // 处理防抖
        let preload = Promise.resolve();
        if (opt?.debounce) {
          const myRank = ++this.rank;
          preload = waiting(opt.debounce, () => {
            return myRank >= this.rank;
          });
        }

        const query = preload
          .then(() => loadData(parseLazyParams(params)))
          .then((items) => {
            const neo = opt?.colorful !== false ? fillColors(items) : items;
            this.setDataSource(neo, params);
            this.cached[cacheKey] = neo;
            return items;
          });

        if (!opt?.debounce) {
          this.pendings[cacheKey] = query;
        }
        return query;
      };
      this.loader = proEnumLoader;
    } else {
      const neo =
        opt?.colorful !== false ? fillColors(itemsOrLoader) : itemsOrLoader;
      this.setDataSource(neo);
    }
  }

  on(cb: (ds: ProEnumItem[]) => boolean) {
    const id = ++this.events.id;

    this.events.map[id] = (dds: ProEnumItem[]) => {
      const rm = cb(dds);
      if (rm) {
        delete this.events.map[id];
      }
    };
  }
  get emap() {
    return this.dataSource.reduce<Map<Value, Value>>((em, item) => {
      em.set(item.value, item.label);
      em.set(item.label, item.value);
      return em;
    }, new Map());
  }

  loader(params?: any): Promise<ProEnumItem[]> {
    return Promise.resolve(this.dataSource);
  }
}

const PRO_ENUM_KEY = "__pro_enum__";
const PRO_ENUM_HIJACK_KEY = "__pro_enum_hijack_info__";

const hijackField = (field: any, props: any) => {
  field.data = field.data ?? {};
  field.data[PRO_ENUM_HIJACK_KEY] = field.data?.[PRO_ENUM_HIJACK_KEY] ?? [];
  field.data[PRO_ENUM_HIJACK_KEY][0] = field.component[0];
  field.data[PRO_ENUM_HIJACK_KEY][1] = field.component[1];
  const oprops = field.component[1];

  field.setComponent(ProEnumPretty, {
    ...props,
    ...oprops,
  });
};

const restoreHijack = (field: any) => {
  const [ocomp, oprops] = field.data[PRO_ENUM_HIJACK_KEY];
  field.setComponent(ocomp, oprops);
};

const setProEnum = (field: any, inst: ProEnum) => {
  field.data = field.data ?? {};
  field.data[PRO_ENUM_KEY] = {
    inst,
    props: field.componentProps?.enum,
  };
  if (field.componentProps?.enum) {
    // biome-ignore lint/performance/noDelete: <explanation>
    delete field.componentProps.enum;
  }
};

const getProEnum = (field: any) => {
  const { inst, props } = field?.data?.[PRO_ENUM_KEY] ?? {};
  return {
    inst: inst as ProEnum | undefined,
    props: props as ProEnumSchemaOption | undefined,
  };
};

const isCcomponentSame = (
  origin: Field["component"],
  comp: string | React.FunctionComponent<any> | Field["component"],
) => {
  const ocomp = Array.isArray(origin) ? origin[0] : origin;
  const dcomp = Array.isArray(comp) ? comp[0] : comp;
  return ocomp === dcomp;
};

export const useProEnumEffects = (opts?: {
  // 劫持 read pretty
  pretty: boolean;
}) => {
  onFieldInit("*", (field) => {
    if (!isDataField(field)) return;
    if (!ProEnum.is(field.dataSource)) return;
    // Immediately, case by dataSource will be consumer by
    // componet, function maybe error;
    const proEnum = field.dataSource;
    field.dataSource = undefined!;

    setProEnum(field, proEnum);

    proEnum.on((neo) => {
      field.dataSource = neo;
      return field.unmounted;
    });

    const { props } = getProEnum(field);

    const remapTo = props?.mapToProp ?? proEnum.mapToProp;

    if (proEnum.isAsync && remapTo) {
      field.componentProps = field.componentProps ?? {};
      field.componentProps[remapTo] = proEnum.loader;
    } else if (proEnum.isAsync) {
      field.loading = true;
      proEnum
        .loader(props?.params)
        .then((dataSource) => {
          field.dataSource = dataSource;
        })
        .finally(() => {
          field.loading = false;
        });
    } else {
      field.dataSource = proEnum.dataSource;
    }
  });

  onFieldReact("*", (field) => {
    if (!isDataField(field)) return;
    const { inst: proEnum, props } = getProEnum(field);
    if (!ProEnum.is(proEnum)) return;
    const pretty = opts?.pretty ?? props?.pretty ?? proEnum?.pretty;
    if (!pretty) return;

    const readPretty = field.readPretty || field.readOnly;

    const origin = field.data?.[PRO_ENUM_HIJACK_KEY];

    if (readPretty) {
      if (!isCcomponentSame(field.component, ProEnumPretty)) {
        hijackField(field, {
          _type: props?.showType,
          _strict: props?.strict,
        });
      }
    } else if (origin && !isCcomponentSame(origin, field.component)) {
      restoreHijack(field);
    }
  });
};
