import { connect, mapProps, observer } from "@formily/react";
import React, { useEffect, useRef, useState } from "react";
import { Cascader as BaseCascader } from "../adaptor";
import { isLabelInValue, prettyEnum, useUpdate } from "../shared";
import { buildTree, ProEnumItem } from "../pro-enum/pro-enum";

const fullWithStyle = {
  width: "100%",
};

type ValueType = ProEnumItem["value"];

type CascaderProps = React.ComponentProps<typeof BaseCascader>;

const display: CascaderProps["displayRender"] = (label: string[]) => {
  return label.join("/");
};

const remapProps = (props: React.ComponentProps<typeof Cascader>) => {
  // type ChangeFnParams = Parameters<Required<CascaderProps>['onChange']>;
  const onChange = (values: any, options: any) => {
    let next = values;
    if (props.labelInValue) {
      next = props.multiple
        ? options.map((arr: ProEnumItem[]) =>
            arr.map((item) => {
              return {
                label: item.label,
                value: item.value,
              };
            }),
          )
        : options.map((item: ProEnumItem) => {
            return {
              label: item.label,
              value: item.value,
            };
          });
    }
    props.onChange?.(next);
  };

  const getValue = (val: any): ValueType[] => {
    return Array.isArray(val)
      ? val.map((item) => {
          // multiple mode
          if (Array.isArray(item)) {
            return getValue(item);
          } else if (item.label) {
            // labelInValue
            return item.value;
          } else {
            return item;
          }
        })
      : [];
  };
  return { onChange, value: getValue(props.value) };
};

const shouldRequery = (values: ProEnumItem["value"][], tree: ProEnumItem[]) => {
  let should = false;
  values.reduce((parent, v) => {
    // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
    const has = parent?.find?.((x) => x.value == v);

    if (has?.children) {
      return has.children as ProEnumItem[];
    } else {
      should = true;
      return [];
    }
  }, tree);

  return should;
};

const fill = (
  tree: ProEnumItem[],
  loader: (values: ProEnumItem["value"][]) => Promise<ProEnumItem[]>,
  cache: Record<ValueType, { key: ValueType; list: ProEnumItem[] }>,
  values?: ValueType[],
) => {
  if (!Array.isArray(values) || values.length === 0) return;
  const should = shouldRequery(values, tree);

  return should
    ? Promise.all(
        values.map((val) => {
          return (
            cache[val!] ??
            loader([val]).then((list) => {
              // cache
              cache[val!] = {
                key: val!,
                list: list,
              };
              return cache[val];
            })
          );
        }),
      ).then((childList) => {
        return childList.reduce((parent, item) => {
          // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
          const me = parent.find((x) => x.value == item.key);
          if (me) {
            me.children = item.list;
            return me.children! as ProEnumItem[];
          } else {
            return [];
          }
        }, tree || []);
      })
    : Promise.resolve([]);
};

const Cascader = observer(
  <TValueType = ValueType[] | ProEnumItem[]>(
    props: Omit<CascaderProps, "value" | "onChange" | "loadData"> & {
      value: TValueType;
      onChange: (neo: TValueType) => void;
      multiple?: boolean;
      labelInValue?: boolean;
      /** 默认懒加载, 与整棵树加载不能共存 */
      loadData?: (selectOptions: ProEnumItem[]) => Promise<ProEnumItem[]>;
      /** loadData 是否返回整棵树加载, 与懒加载不能共存 */
      all?: boolean;
      readPretty?: boolean;
    },
  ) => {
    const {
      loadData,
      all,
      readPretty,
      disabled,
      multiple,
      labelInValue,
      ...others
    } = props;

    const update = useUpdate();

    const loaderCache = useRef({});

    const optionsRef = useRef(props.options);
    const selfOptions = useRef<ProEnumItem[]>([]);
    useEffect(() => {
      optionsRef.current = props.options;
    }, [props.options]);
    const [loading, setLoading] = useState(false);

    const { onChange, value } = remapProps(props as any);

    useEffect(() => {
      if (!loadData) return;
      setLoading(true);
      // load root
      loadData([])
        .then((options) => {
          selfOptions.current = options;
          const values = value.map((x) => x);
          setLoading(true);
          return all
            ? null
            : Promise.all(
                (multiple ? values : [values]).map((valueList) => {
                  return fill(
                    (optionsRef.current as any) || selfOptions.current,
                    loadData as any,
                    loaderCache.current,
                    valueList as any,
                  );
                }),
              );
        })
        .finally(() => {
          setLoading(false);
        });
    }, [loadData]);

    const _loadData =
      all || !loadData
        ? undefined
        : // arco 是只有 value
          (ooptions: Array<ProEnumItem | ProEnumItem["value"]>) => {
            const values = ooptions.map((item) =>
              isLabelInValue(item) ? item.value : item,
            );
            const should = shouldRequery(values, selfOptions.current);
            return should
              ? loadData(values as any)
                  .then((options) => {
                    const neo = buildTree(
                      values,
                      selfOptions.current as any,
                      options,
                    );
                    selfOptions.current = neo;
                  })
                  .finally(() => {
                    update();
                  })
              : update();
          };

    return readPretty ? (
      <React.Fragment>
        {display(prettyEnum(value, props.options as any))}
      </React.Fragment>
    ) : (
      <BaseCascader
        multiple={multiple}
        displayRender={display}
        changeOnSelect
        {...others}
        loading={loading}
        value={value as any}
        style={props.style || fullWithStyle}
        options={[...(props.options || selfOptions.current || ([] as any))]}
        loadData={_loadData as any}
        onChange={onChange as any}
      />
    );
  },
);

export const CascaderPlus = connect(
  Cascader,
  mapProps({
    dataSource: "options",
    readPretty: true,
  }),
);
