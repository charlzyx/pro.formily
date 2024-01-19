import { useField } from "@formily/react";
import React, { useState } from "react";
import { BUTTON_TYPE, Button, Drawer } from "../adaptor";
import { RecordFormProps, useFieldRecordForm } from "./hooks";

export const ProDrawer: React.FC<
  RecordFormProps &
    React.ComponentProps<typeof Drawer> & {
      onCancel: () => void | Promise<void>;
      onConfirm: (data: any) => void | Promise<void>;
    }
> = ({ children, ...fieldProps }) => {
  const field = useField();
  const { body, form, FormButtons } = useFieldRecordForm(fieldProps);
  const [visible, setVisible] = useState(false);
  const props = field.componentProps;
  return (
    <React.Fragment>
      <Drawer
        destroyOnClose
        size="large"
        {...props}
        open={visible}
        onClose={() => setVisible(false)}
        footer={
          <FormButtons
            onReset={() => {
              form
                .reset()
                .then(props.onCancel)
                .then(() => {
                  setVisible(false);
                });
            }}
            onSubmit={() => {
              form
                .submit()
                .then(props.onConfirm)
                .then(() => {
                  setVisible(false);
                });
            }}
          />
        }
      >
        {body}
      </Drawer>
      <Button
        type={BUTTON_TYPE}
        {...props.buttonProps}
        disabled={!field.editable}
        onClick={() => setVisible(true)}
      >
        {field.title}
      </Button>
    </React.Fragment>
  );
};
