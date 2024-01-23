import { ISchema, ReactFC, useField } from "@formily/react";
import { clone, isUndef, isValid } from "@formily/shared";
import cls from "classnames";
import React, { Fragment, useContext } from "react";
import {
  BUTTON_TYPE,
  Button,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  Popconfirm,
  UpOutlined,
} from "../adaptor";
import { ArrayBase, IArrayBaseContext, usePrefixCls } from "../adaptor/adaptor";
import { TablePaginationContext } from "./features/pagination";
import type { ColumnProps, IProArrayTableBaseMixins } from "./types";

export const Column: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};
export const RowExpand: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};
const useArray = ArrayBase.useArray;
const useIndex = ArrayBase.useIndex;

const getSchemaDefaultValue = (schema: ISchema) => {
  if (schema?.type === "array") return [];
  if (schema?.type === "object") return {};
  if (schema?.type === "void") {
    for (const key in schema.properties) {
      const value = getSchemaDefaultValue(
        (schema.properties as any)[key],
      ) as any;
      if (isValid(value)) return value;
    }
  }
};

const getDefaultValue = (defaultValue: any, schema: ISchema) => {
  if (isValid(defaultValue)) return clone(defaultValue);
  if (Array.isArray(schema?.items))
    return getSchemaDefaultValue(schema?.items[0]);
  return getSchemaDefaultValue(schema?.items as any);
};

type ProArrayBaseContext = Omit<IArrayBaseContext, "props"> & {
  props: IProArrayTableBaseMixins & { disabled?: boolean };
};

export const Addition = (
  props: React.ComponentProps<typeof ArrayBase.Addition>,
) => {
  const self = useField();
  const array = useArray() as ProArrayBaseContext;
  const page = useContext(TablePaginationContext);

  const prefixCls = usePrefixCls("formily-array-base");
  if (!array) return null;
  if (
    array.field?.pattern !== "editable" &&
    array.field?.pattern !== "disabled"
  )
    return null;
  return (
    <Button
      type={BUTTON_TYPE}
      // @ts-ignore
      block
      {...props}
      disabled={self?.disabled}
      className={cls(`${prefixCls}-addition`, props.className)}
      onClick={(e) => {
        if (array.props?.disabled) return;
        if (props.onClick) {
          props.onClick(e);
          if (e.defaultPrevented) return;
        }
        const defaultValue = getDefaultValue(props.defaultValue, array.schema);
        Promise.resolve(() => {
          const toIndex =
            props.method === "unshift" ? 0 : array?.field?.value?.length;
          return array.props.onAdd?.(toIndex, defaultValue, array.field);
        }).then(() => {
          if (props.method === "unshift") {
            array.field?.unshift?.(defaultValue);
          } else {
            array.field?.push?.(defaultValue);
          }
          // 如果添加数据后将超过当前页，则自动切换到下一页
          if (!page) return;
          const total = array?.field?.value.length || 0;
          if (total >= page!.current! * page.pageSize!) {
            page.setPagination((memo) => {
              return { ...memo, current: memo.current + 1 };
            });
          }
        });
      }}
      icon={isUndef(props.icon) ? <PlusOutlined /> : props.icon}
    >
      {props.title || self.title}
    </Button>
  );
};
export const Copy = React.forwardRef(
  (props: React.ComponentProps<typeof ArrayBase.Copy>, ref: any) => {
    const self = useField();
    const array = useArray() as ProArrayBaseContext;

    const index = useIndex(props.index);
    const prefixCls = usePrefixCls("formily-array-base");
    if (!array) return null;
    if (array.field?.pattern !== "editable") return null;
    return (
      <Button
        type="text"
        {...props}
        disabled={self?.disabled}
        className={cls(
          `${prefixCls}-copy`,
          self?.disabled ? `${prefixCls}-copy-disabled` : "",
          props.className,
        )}
        ref={ref}
        onClick={(e: any) => {
          if (self?.disabled) return;
          e.stopPropagation();
          if (array.props?.disabled) return;
          if (props.onClick) {
            props.onClick(e);
            if (e.defaultPrevented) return;
          }
          const value = clone(array?.field?.value[index]);
          const distIndex = index + 1;

          Promise.resolve(() => {
            return array.props?.onCopy?.(distIndex, value, array.field);
          }).then(() => {
            array.field?.insert?.(distIndex, value);
          });
        }}
        icon={isUndef(props.icon) ? <CopyOutlined /> : props.icon}
      >
        {props.title || self.title}
      </Button>
    );
  },
);

export const Remove = React.forwardRef(
  (
    props: React.ComponentProps<typeof ArrayBase.Remove> & {
      confirm?: true | React.ComponentProps<typeof Popconfirm>;
    },
    ref: any,
  ) => {
    const index = useIndex(props.index);
    const self = useField();
    const array = useArray() as ProArrayBaseContext;

    const prefixCls = usePrefixCls("formily-array-base");
    if (!array) return null;
    if (array.field?.pattern !== "editable") return null;
    const onClick = (e: any) => {
      if (self?.disabled) return;
      e.stopPropagation();
      if (props.onClick) {
        props.onClick(e);
        if (e.defaultPrevented) return;
      }
      Promise.resolve(() => {
        return array.props?.onRemove?.(index, array.field);
      }).then(() => {
        array.field?.remove?.(index);
      });
    };
    const Wrapper = props.confirm ? Popconfirm : React.Fragment;
    const confirmProps =
      props.confirm && props.confirm !== true
        ? props.confirm
        : {
            onConfirm: onClick,
            title: "确定要删除此项吗?",
            okText: "我确定",
            cancel: "我在想想",
          };
    return (
      <Wrapper {...confirmProps}>
        <Button
          type="text"
          {...props}
          disabled={self?.disabled}
          className={cls(
            `${prefixCls}-remove`,
            self?.disabled ? `${prefixCls}-remove-disabled` : "",
            props.className,
          )}
          ref={ref}
          onClick={props.confirm ? undefined : onClick}
          icon={isUndef(props.icon) ? <DeleteOutlined /> : props.icon}
        >
          {props.title || self.title}
        </Button>
      </Wrapper>
    );
  },
);

export const MoveDown = React.forwardRef(
  (props: React.ComponentProps<typeof ArrayBase.MoveDown>, ref: any) => {
    const index = useIndex(props.index);
    const self = useField();
    const array = useArray() as ProArrayBaseContext;

    const prefixCls = usePrefixCls("formily-array-base");
    if (!array) return null;
    if (array.field?.pattern !== "editable") return null;
    return (
      <Button
        type="text"
        {...props}
        disabled={self?.disabled}
        className={cls(
          `${prefixCls}-move-down`,
          self?.disabled ? `${prefixCls}-move-down-disabled` : "",
          props.className,
        )}
        ref={ref}
        onClick={(e: any) => {
          if (self?.disabled) return;
          e.stopPropagation();
          if (props.onClick) {
            props.onClick(e);
            if (e.defaultPrevented) return;
          }
          Promise.resolve(() => {
            return array.props?.onMoveDown?.(index, array.field);
          }).then(() => {
            array.field?.moveDown?.(index);
          });
        }}
        icon={isUndef(props.icon) ? <DownOutlined /> : props.icon}
      >
        {props.title || self.title}
      </Button>
    );
  },
);

export const MoveUp = React.forwardRef(
  (props: React.ComponentProps<typeof ArrayBase.MoveUp>, ref: any) => {
    const index = useIndex(props.index);
    const self = useField();
    const array = useArray() as ProArrayBaseContext;

    const prefixCls = usePrefixCls("formily-array-base");
    if (!array) return null;
    if (array.field?.pattern !== "editable") return null;
    return (
      <Button
        type="text"
        {...props}
        disabled={self?.disabled}
        className={cls(
          `${prefixCls}-move-up`,
          self?.disabled ? `${prefixCls}-move-up-disabled` : "",
          props.className,
        )}
        ref={ref}
        onClick={(e: any) => {
          if (self?.disabled) return;
          e.stopPropagation();
          if (props.onClick) {
            props.onClick(e);
            if (e.defaultPrevented) return;
          }
          Promise.resolve(() => {
            return array.props?.onMoveUp?.(index, array.field);
          }).then(() => {
            array.field?.moveUp?.(index);
          });
        }}
        icon={isUndef(props.icon) ? <UpOutlined /> : props.icon}
      >
        {props.title || self.title}
      </Button>
    );
  },
);
