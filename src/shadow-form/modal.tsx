import { VoidField } from "@formily/core";
import { FormProvider, observer, useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { useEffect, useRef, useState } from "react";
import { BUTTON_TYPE, Button, Modal } from "../adaptor";
import { ShadowFormWrappedProps } from "./shadow-form";

const HideInBush: React.CSSProperties = {
  width: 0,
  height: 0,
};

export const ShadowModal: React.FC<
  ShadowFormWrappedProps &
    Omit<React.ComponentProps<typeof Modal>, "onOk"> & {
      initLoader?: React.MutableRefObject<() => object | Promise<object>>;
      children?: React.ReactElement;
      onOk?: (data: any) => void | Promise<void>;
    }
> = observer(
  ({ form, schema, SchemaField, initLoader, children, ...props }) => {
    const field = useField<VoidField>();

    const [visible, setVisible] = useState(false);
    const pending = useRef(false);
    const navRef = useRef<HTMLSpanElement>(null);

    const init = (c = 0) => {
      if (!form) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(init(c + 1));
          }, 16);
        });
      }
      if (c > 1000) {
        return Promise.reject();
      }
      if (initLoader?.current) {
        return Promise.resolve(initLoader.current()).then((init) => {
          form?.setValues(toJS(init || {}));
        });
      } else {
        return Promise.resolve(form?.setValues(toJS(field.record)));
      }
    };

    useEffect(() => {
      if (navRef.current) {
        const sib = navRef.current.nextSibling;
        if (!sib) return;
        const onClick = () => {
          setVisible(true);
        };
        sib.addEventListener("click", onClick);
        return () => {
          sib.removeEventListener("click", onClick);
        };
      }
    }, []);

    useEffect(() => {
      if (visible) {
        init();
      }
    }, [visible]);

    const reset = () => {
      setVisible(false);
      pending.current = true;
      return new Promise((resolve) => {
        // 优化关闭展示
        setTimeout(() => {
          return resolve(form?.reset());
        }, 200);
      }).finally(() => {
        pending.current = false;
      });
    };

    return (
      <React.Fragment>
        <Modal
          {...props}
          open={visible}
          onCancel={(e: any) => {
            if (pending.current) return;
            return form
              ?.reset()
              .then(() => props?.onCancel?.(e))
              .then(() => reset());
          }}
          onOk={() => {
            if (pending.current) return;
            return form
              ?.submit()
              .then((data: any) => props?.onOk?.(data))
              .then(() => reset());
          }}
        >
          <FormProvider form={form}>
            <SchemaField schema={schema}></SchemaField>
          </FormProvider>
        </Modal>
        {children ? (
          <React.Fragment>
            <span ref={navRef} style={HideInBush}></span>
            {children}
          </React.Fragment>
        ) : (
          <Button
            type={BUTTON_TYPE}
            size="small"
            onClick={() => setVisible(true)}
          >
            {field.title}
          </Button>
        )}
      </React.Fragment>
    );
  },
);
