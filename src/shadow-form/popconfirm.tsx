import { Field } from "@formily/core";
import { FormProvider, useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { useEffect, useRef, useState } from "react";
import { BUTTON_TYPE, Button, Popconfirm } from "../adaptor";
import { ShadowFormWrappedProps } from "./shadow-form";

export const ShadowPopconfirm: React.FC<
  ShadowFormWrappedProps &
    React.ComponentProps<typeof Popconfirm> & {
      initLoader?: React.MutableRefObject<
        (record: any) => object | Promise<object>
      >;
    }
> = ({ form, SchemaField, schema, initLoader, ...props }) => {
  const field = useField<Field>();
  const [visible, setVisible] = useState(false);
  const pending = useRef(false);

  const reset = () => {
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

  useEffect(() => {
    if (visible) {
      if (initLoader?.current) {
        Promise.resolve(initLoader.current(field.record)).then((init) => {
          form.setValues(toJS(init || {}));
        });
      } else {
        Promise.resolve(form.setValues(toJS(field.record)));
      }
    }
  }, [visible, initLoader?.current]);

  return (
    <Popconfirm
      {...props}
      open={visible}
      onOpenChange={(o) => {
        if (o !== visible) {
          return setVisible(o);
        }
        if (o === false) {
          return reset();
        }
      }}
      onCancel={(e) => {
        if (pending.current) return;
        return form
          .reset()
          .then(() => props?.onCancel?.(e))
          .then(() => reset());
      }}
      onConfirm={(e) => {
        if (pending.current) return;
        return form
          .submit()
          .then(() => props?.onConfirm?.(e))
          .then(() => reset());
      }}
      title={
        <FormProvider form={form}>
          <SchemaField schema={schema}></SchemaField>
        </FormProvider>
      }
      icon={null}
    >
      {props.children ? (
        props.children
      ) : (
        <Button type={BUTTON_TYPE} size="small">
          {field.title}
        </Button>
      )}
    </Popconfirm>
  );
};
