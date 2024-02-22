import type { Value, ProEnumItem } from "./pro-enum";
import { Badge, Space, Tag } from "../adaptor/index";
import { mapProps, connect } from "@formily/react";
import { useMemo } from "react";
export const EnumReadPretty: React.FC<{
  /**
   * 对应枚举值
   * @type Value = string | number | Value[];
   */
  value?: Value | Value[];
  /** 渲染形式 Badeg | Tag */
  showType?: "badge" | "tag";
  // same with strictMode,  to prvent React Warning cameCase Property on Dom
  _type?: "badge" | "tag";
  /** 选项 */
  options?: ProEnumItem[];
  /**
   * 严格模式, 将使用 === 来对比 value
   * 非严格模式下采用 == 对比
   * @default false
   */
  strictMode?: boolean;
  // same with strictMode,  to prvent React Warning cameCase Property on Dom
  _strict?: boolean;
  empty?: React.ReactNode;
}> = (props) => {
  const { strictMode, _strict, showType, _type, value, options } = props;
  const strict = _strict ?? strictMode;
  const type = _type ?? showType;
  const items = useMemo(() => {
    if (!Array.isArray(options)) return [];
    const ret = Array.isArray(value)
      ? value.map((v) =>
          // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
          options.find((x) => (strict ? x.value === v : x.value == v)),
        )
      : // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
        [options.find((x) => (strict ? x.value === value : x.value == value))];
    return ret.filter(Boolean);
  }, [options, strict, value]);

  return (
    <Space size="small">
      {items.length > 0
        ? items.map((item) => {
            return type === "badge" ? (
              <Badge key={item?.value} color={item?.color} text={item?.label} />
            ) : type === "tag" ? (
              <Tag key={item?.value} color={item?.color}>
                {item?.label}
              </Tag>
            ) : (
              item?.label
            );
          })
        : props.empty ?? "-"}
    </Space>
  );
};

export const ProEnumPretty = connect(
  EnumReadPretty,
  mapProps({ dataSource: "options" }),
);
