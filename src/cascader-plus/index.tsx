import { connect, mapProps, observer } from "@formily/react";
import { model } from "@formily/reactive";
import React, { useEffect, useMemo, useRef } from "react";
import { Cascader as BaseCascader } from "../adaptor";
import { prettyEnum } from "../shared";

export interface CascaderPlusOption<Value extends ValueType> {
  label: string;
  value: Value;
  isLeaf?: boolean;
  children?: CascaderPlusOption<Value>[];
  disabled?: boolean;
  loading?: boolean;
}

const fullWithStyle = {
  width: "100%",
};

type ValueType = string | number;
type LabelValueType = { label: string; value: ValueType };

export type LinkageValueType = LabelValueType[] | ValueType[];

type CascaderProps = React.ComponentProps<typeof BaseCascader>;

const display: CascaderProps["displayRender"] = (label) => {
  return label.join("/");
};

const remapProps = (props: React.ComponentProps<typeof Cascader>) => {
  // type ChangeFnParams = Parameters<Required<CascaderProps>['onChange']>;
  const onChange = (values: any, options: any) => {
    let next = values;
    if (props.labelInValue) {
      next = props.multiple
        ? options.map((arr: LabelValueType[]) =>
            arr.map((item) => {
              return {
                label: item.label,
                value: item.value,
              };
            }),
          )
        : options.map((item: LabelValueType) => {
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

const fill = <
  Option extends CascaderPlusOption<ValueType> = CascaderPlusOption<ValueType>,
>(
  $options: Option[],
  loader: (opts: Option[]) => Promise<Option[]>,
  cache: Record<ValueType, { key: ValueType; list: Option[] }>,
  values?: ValueType[],
) => {
  if (!Array.isArray(values) || values.length === 0) return;
  let should = false;
  // 反向排列value值 [河南省->鹤壁市->浚县] => [浚县->鹤壁市->河南省]
  const asOptions = [] as Option[];
  values.reduce((parent, v) => {
    // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
    const has = parent ? parent.find((x) => x.value == v) : false;
    if (!has) {
      should = true;
      asOptions.unshift({ value: v } as Option);
      return [];
    } else {
      asOptions.unshift({ value: v } as Option);
      return has.children as Option[];
    }
  }, $options);

  return should
    ? Promise.all(
        asOptions.map((optLike) => {
          return (
            cache[optLike.value!] ??
            loader([optLike]).then((list) => {
              // cache
              cache[optLike.value!] = {
                key: optLike.value!,
                list: list,
              };
              return cache[optLike.value!];
            })
          );
        }),
      ).then((childList) => {
        // 在这里返回来 [浚县->鹤壁市->河南省] => [河南省->鹤壁市->浚县]
        return childList.reduceRight((parent, item) => {
          // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
          const me = parent.find((x) => x.value == item.key);
          me!.children = item.list;
          return me!.children! as Option[];
        }, $options);
      })
    : Promise.resolve([]);
};

// export const pretty = (
//   value: ValueType[] | LabelValueType[],
//   options: CascaderPlusOption<ValueType>[],
// ) => {
//   let labels = [];
//   if ((value?.[0] as LabelValueType)?.label) {
//     labels = (value as LabelValueType[]).map((item) => item.label);
//   } else {
//     const found = value.reduce(
//       (info, val) => {
//         // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
//         const me = info.parent.find((x) => x.value == val);
//         if (me) {
//           info.chain.push(me.label!);
//           info.parent = me.children!;
//         }
//         return info;
//       },
//       { parent: options, chain: [] as string[] },
//     );
//     labels = found.chain;
//   }
//   return labels;
// };

const Cascader = observer(
  <TValueType = ValueType[] | LabelValueType[]>(
    props: Omit<CascaderProps, "value" | "onChange" | "loadData"> & {
      value: TValueType;
      onChange: (neo: TValueType) => void;
      multiple?: boolean;
      disabled?: boolean;
      labelInValue?: boolean;
      /** 懒加载, 与整棵树加载不能共存 */
      loadData?: (
        selectOptions: LabelValueType[],
      ) => Promise<CascaderPlusOption<ValueType>[]>;
      /** loadData 是否返回整棵树加载, 与懒加载不能共存 */
      all?: boolean;
      readPretty?: boolean;
    },
  ) => {
    const {
      loadData,
      all,
      readPretty,
      labelInValue,
      disabled,
      multiple,
      ...others
    } = props;

    const state = useMemo(() => {
      return model({
        loading: false,
        options: [] as CascaderPlusOption<ValueType>[],
      });
    }, []);
    const { onChange, value } = remapProps(props as any);
    const loaderCache = useRef({});

    useEffect(() => {
      if (!loadData) return;
      state.loading = true;
      loadData([])
        .then((options) => {
          state.options = options;
          const values = value.map((x) => x);
          state.loading = true;
          return all
            ? null
            : Promise.all(
                (multiple ? values : [values]).map((valueList) => {
                  return fill(
                    state.options,
                    loadData as any,
                    loaderCache.current,
                    valueList as any,
                  );
                }),
              );
        })
        .finally(() => {
          state.loading = false;
        });
    }, [loadData, state]);

    const _loadData =
      all || !loadData
        ? undefined
        : (options: CascaderPlusOption<ValueType>[]) => {
            const last = options[options.length - 1];
            if (last.children) return;
            last.loading = true;
            // 触发组件更新啦 state.loading -> [...state.options]
            state.loading = true;
            return loadData(options as any)
              .then((children) => {
                if (Array.isArray(children) && children.length > 0) {
                  last.children = children;
                } else {
                  last.isLeaf = true;
                }
              })
              .finally(() => {
                last.loading = false;
                // 触发组件更新啦 state.loading -> [...state.options]
                state.loading = false;
              });
          };
    return readPretty ? (
      // biome-ignore lint/complexity/noUselessFragments: <explanation>
      <React.Fragment>
        {display(prettyEnum(value, state.options))}
      </React.Fragment>
    ) : (
      <BaseCascader
        multiple={multiple}
        displayRender={display}
        changeOnSelect
        {...others}
        loading={state.loading}
        value={value as any}
        style={props.style || fullWithStyle}
        options={[...state.options]}
        loadData={_loadData as any}
        onChange={onChange as any}
      />
    );
  },
);

export const CascaderPlus = connect(
  Cascader,
  mapProps({
    readPretty: true,
  }),
);
