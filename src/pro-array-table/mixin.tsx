import { FormProvider, ReactFC, observer, useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { Fragment, useContext, useEffect, useRef } from "react";
import { useRecord } from "..";
import { Alert, BUTTON_TYPE, Button, Divider, Modal, Space } from "../adaptor";
import { ArrayBase, ArrayBaseMixins } from "../adaptor/adaptor";
import { ShadowForm, ShadowFormContext } from "../shadow-form/shadow-form";
import {
  ArrayTableDelegateContext,
  DATE_DELEGATE_ACT_KEY,
  DATE_DELEGATE_INDEX_KEY,
  IArrayTableDelegateContext,
} from "./features/delegate";
import { TableExpandableContext } from "./features/expandable";
import { TablePaginationContext } from "./features/pagination";
import { TableRowSelectionContext } from "./features/row-selection";
import type { ColumnProps } from "./types";

export const Column: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};
export const RowExpand: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
  const array = ArrayBase.useArray();
  const page = useContext(TablePaginationContext);
  return (
    <ArrayBase.Addition
      // @ts-ignore
      block={false}
      type={BUTTON_TYPE}
      {...props}
      onClick={(e) => {
        // 如果添加数据后将超过当前页，则自动切换到下一页
        if (!page) return;
        const total = array?.field?.value.length || 0;
        if (total >= page!.current! * page.pageSize!) {
          page.setPagination((memo) => {
            return { ...memo, current: memo.current + 1 };
          });
        }
        props.onClick?.(e);
      }}
    />
  );
});

const justifyContentList: Required<React.CSSProperties>["justifyContent"][] = [
  "space-around",
  "space-between",
  "space-evenly",
  "flex-start",
  "flex-end",
];
export const Flex = (
  props: React.PropsWithChildren<
    {
      hidden?: boolean;
      between?: boolean;
      around?: boolean;
      evenly?: boolean;
      center?: boolean;
      start?: boolean;
      end?: boolean;
    } & Pick<React.CSSProperties, "marginTop" | "marginBottom">
  >,
) => {
  const justifyContent = Object.keys(props).find((key) =>
    justifyContentList.find((prop) => new RegExp(key).test(prop)),
  );

  return props.hidden ? null : (
    <div
      style={{
        display: "flex",
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        flex: 1,
        alignItems: "center",
        justifyContent,
      }}
    >
      {props.children}
    </div>
  );
};

export const RowSelectionPro = (props: {
  ds: any[];
  rowKey: (record: any) => string | number;
}) => {
  const { ds, rowKey } = props;
  const array = ArrayBase.useArray();
  const $row = useContext(TableRowSelectionContext);
  // const [, $row] = useArrayCompPropsOf(array?.field, "rowSelection");
  return ds.length > 0 ? (
    <Alert
      style={{ padding: "3px 4px" }}
      type="info"
      message={
        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type="text"
            size="small"
            style={{ width: "60px", textAlign: "left" }}
          >
            选中 {$row?.selectedRowKeys?.length} 项
          </Button>
          <Button
            size="small"
            onClick={() => {
              if (!$row) return;
              $row.setSelectedRowKeys([]);
            }}
            type={BUTTON_TYPE}
          >
            清空
          </Button>
          <Button
            size="small"
            onClick={() => {
              if (!$row) return;
              const keys: (string | number)[] = [];
              ds.forEach((item) => {
                const key = rowKey(item);
                keys.push(key);
              });
              $row.setSelectedRowKeys(keys);
            }}
            type={BUTTON_TYPE}
          >
            全选
          </Button>

          <Button
            size="small"
            onClick={() => {
              if (!$row) return;
              const selected = $row.selectedRowKeys.reduce(
                (m: Record<string | number, true>, i: any) => {
                  m[i] = true;
                  return m;
                },
                {},
              );
              const keys: (string | number)[] = [];
              ds.forEach((item) => {
                const key = rowKey(item);
                if (!selected[key]) {
                  keys.push(key);
                }
              });
              $row.setSelectedRowKeys(keys);
            }}
            type={BUTTON_TYPE}
          >
            反选
          </Button>
        </Space>
      }
    />
  ) : null;
};

export const useProArrayTableContext = () => {
  const array = ArrayBase.useArray();
  const pagination = useContext(TablePaginationContext);
  const rowSelection = useContext(TableRowSelectionContext);
  const expanedable = useContext(TableExpandableContext);
  return { array, pagination, rowSelection, expanedable };
};

export const ShadowModal: React.FC<
  Omit<React.ComponentProps<typeof Modal>, "children" | "onCancel" | "onOk"> & {
    onCancel?: (
      ctx: ReturnType<typeof useProArrayTableContext>,
    ) => void | Promise<void>;
    onOk?: (
      data: any,
      ctx: ReturnType<typeof useProArrayTableContext>,
    ) => void | Promise<void>;
  }
> = (props) => {
  const { SchemaField, form, act, schema } = useContext(ShadowFormContext);
  const delegate = useContext(ArrayTableDelegateContext);
  const visible = delegate.act === act && delegate.index > -1;
  const pending = useRef(false);
  const ctx = useProArrayTableContext();

  useEffect(() => {
    if (visible) {
      // 需要等等的  trigger 里面 initLoader.current set 的 nextick 吗?
      Promise.resolve(delegate.initLoader?.current?.()).then((init) => {
        form.setInitialValues(toJS(init || {}));
      });
    }
  }, [visible]);

  const reset = () => {
    delegate.setAct({ act: "", index: -1 });
    pending.current = true;
    return new Promise((resolve) => {
      // 优化关闭展示
      setTimeout(() => {
        return resolve(form.reset("*", { forceClear: true, validate: true }));
      }, 200);
    }).finally(() => {
      pending.current = false;
    });
  };

  return (
    <Modal
      {...props}
      open={visible}
      onCancel={() => {
        if (pending.current) return;
        return form
          .reset()
          .then(() => props?.onCancel?.(ctx))
          .then(() => reset());
      }}
      onOk={() => {
        if (pending.current) return;
        return form
          .submit()
          .then((data) => {
            return props?.onOk?.(data, ctx);
          })
          .then(() => reset());
      }}
    >
      <FormProvider form={form}>
        <SchemaField schema={schema}></SchemaField>
      </FormProvider>
    </Modal>
  );
};
export const DelegateAction: React.FC<{
  act: string;
  index?: number;
  initLoader?: Required<IArrayTableDelegateContext>["initLoader"]["current"];
  children?: React.ReactElement;
}> = (props) => {
  const index = "index" in (props ?? {}) ? props.index : ArrayBase.useIndex();
  const field = useField();
  const record = useRecord();
  const delegate = useContext(ArrayTableDelegateContext);

  useEffect(() => {
    if (!delegate.initLoader) return;
    if (delegate.act === props.act && delegate.index === index) {
      delegate.initLoader.current = props.initLoader
        ? props.initLoader
        : () => record;
    }
  }, [delegate.act, delegate.index, delegate.initLoader]);

  const dataInfo = {
    [DATE_DELEGATE_ACT_KEY]: props.act,
    [DATE_DELEGATE_INDEX_KEY]: index,
  };

  return props.children ? (
    React.cloneElement(props.children, {
      ...props.children.props,
      ...dataInfo,
    })
  ) : (
    <Button size="small" type={BUTTON_TYPE} {...dataInfo}>
      {field.title}
    </Button>
  );
};

export const ProAddition = ({
  schema,
  form,
  schemaFieldOptions,
  popType = "modal",
  ...props
}: Omit<React.ComponentProps<typeof ShadowForm>, "act"> & {
  popType: "modal" | "drawer";
}) => {
  return (
    <React.Fragment>
      <ShadowForm
        act="_pro_addtion"
        schema={schema}
        form={form}
        schemaFieldOptions={schemaFieldOptions}
      >
        <ShadowModal {...(props as any)}></ShadowModal>
      </ShadowForm>
      <DelegateAction index={Infinity} act={"_pro_addtion"}></DelegateAction>
    </React.Fragment>
  );
};
