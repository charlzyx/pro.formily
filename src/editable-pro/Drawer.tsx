import { useField } from "@formily/react";
import React, { useState } from "react";
import { Button, Drawer, DrawerProps } from "../adaptor";
import { RecordFormProps, useFieldRecordForm } from "./hooks";

export const ProDrawer: React.FC<
  RecordFormProps &
    DrawerProps & {
      onCancel: () => void | Promise<void>;
      onConfirm: (data: any) => void | Promise<void>;
    }
> = (props) => {
  const field = useField();
  const { FormBody, form, FormButtons } = useFieldRecordForm(props);
  const [visible, setVisible] = useState(false);

  return (
    <React.Fragment>
      <Drawer
        destroyOnClose
        size="large"
        {...props}
        open={visible}
        onClose={() => setVisible(false)}
        extra={
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
        <FormBody></FormBody>
      </Drawer>
      <Button
        type="link"
        {...props.buttonProps}
        disabled={!field.editable}
        onClick={() => setVisible(true)}
      >
        {field.title}
      </Button>
    </React.Fragment>
  );
};
