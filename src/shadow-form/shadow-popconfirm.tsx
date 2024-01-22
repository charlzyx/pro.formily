import { Field } from "@formily/core";
import { FormProvider, useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { useContext, useEffect, useRef, useState } from "react";
import { BUTTON_TYPE, Button, Popconfirm } from "../adaptor";
import { ShadowFormContext } from "../shadow-form/shadow-form";

export const ShadowPopconfirm: React.FC<
  React.ComponentProps<typeof Popconfirm> & {
    initLoader?: React.MutableRefObject<() => object | Promise<object>>;
  }
> = ({ initLoader, ...props }) => {
  const field = useField<Field>();
  const [visible, setVisible] = useState(false);
  const pending = useRef(false);
  const { SchemaField, form, schema } = useContext(ShadowFormContext);

  const reset = () => {
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

  useEffect(() => {
    if (visible) {
      if (initLoader?.current) {
        Promise.resolve(initLoader.current()).then((init) => {
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
      popupVisible={visible}
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
    >
      {props.children ? props.children : field.title}
    </Popconfirm>
  );
};
