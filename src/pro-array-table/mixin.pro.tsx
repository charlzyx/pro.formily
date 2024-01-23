import { FormProvider, useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { useContext, useEffect, useRef } from "react";
import { omit, pick } from "../__builtins__";
import { Alert, BUTTON_TYPE, Button, Divider, Modal, Space } from "../adaptor";
import { ArrayBase } from "../adaptor/adaptor";
import { IShadowFormOptions, useShadowForm } from "../shadow-form/shadow-form";
import { useRecord } from "../shared";
import {
  ArrayTableDelegateContext,
  DATE_DELEGATE_ACT_KEY,
  DATE_DELEGATE_INDEX_KEY,
  IArrayTableDelegateContext,
} from "./features/delegate";
import { TableRowSelectionContext } from "./features/row-selection";
import { useProArrayTableContext } from "./hooks";

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
  const $row = useContext(TableRowSelectionContext);
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

export interface CommonShadowPopup extends IShadowFormOptions {
  act?: string;
  onCancel?: (
    ctx: ReturnType<typeof useProArrayTableContext>,
  ) => void | Promise<void>;
  onOk?: (
    data: any,
    ctx: ReturnType<typeof useProArrayTableContext>,
  ) => void | Promise<void>;
}

export const ArrayTableShowModal: React.FC<
  Omit<React.ComponentProps<typeof Modal>, "children" | "onCancel" | "onOk"> &
    CommonShadowPopup
> = (props) => {
  const { SchemaField, form, schema } = useShadowForm(
    pick(props, "schema", "schemaFieldOptions", "form"),
  );
  const act = props.act ?? schema.name;
  const field = useField();
  const delegate = useContext(ArrayTableDelegateContext);
  const visible = delegate.act === act && delegate.index > -1;
  const pending = useRef(false);
  const ctx = useProArrayTableContext();

  useEffect(() => {
    if (visible) {
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
        return resolve(form.reset());
      }, 200);
    }).finally(() => {
      pending.current = false;
    });
  };

  return (
    <Modal
      {...omit(props, "act", "schema", "schemaFieldOptions", "form")}
      open={visible}
      title={field.title}
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
  /** 动作标志, 与 ShadowModal 对应  */
  act: string;
  /** 当前列所属 index, 默认使用 ArrayBase.useIndex() 获取当前数据对应位置 */
  index?: number;
  /** 数据初始化加载器, 默认使用 field.record 当前模型所对应 record */
  initLoader?: Required<IArrayTableDelegateContext>["initLoader"]["current"];
  /**
   * 具体元素, 但必须有标签包装, 因为会被追加 data-属性字段标志给事件委托来识别
   * 不填写的情况下, 使用 Button 标签包装 field.title
   */
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
  popType = "modal",
  ...props
}: Omit<CommonShadowPopup, "act"> & {
  popType: "modal" | "drawer";
} & Omit<
    React.ComponentProps<typeof Modal>,
    "onOk" | "onCancel" | "children"
  >) => {
  return (
    <React.Fragment>
      <ArrayTableShowModal act="_pro_addition" {...props}></ArrayTableShowModal>
      <DelegateAction index={Infinity} act={"_pro_addition"}></DelegateAction>
    </React.Fragment>
  );
};