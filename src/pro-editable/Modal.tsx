import { useField } from "@formily/react";
import React, { useState } from "react";
import { BUTTON_TYPE, Button, Modal } from "../adaptor";
import { RecordFormProps, useFieldRecordForm } from "./hooks";

export const ProModal: React.FC<
  RecordFormProps &
    React.ComponentProps<typeof Modal> & {
      onCancel: () => void | Promise<void>;
      onConfirm: (data: any) => void | Promise<void>;
    }
> = ({ children, ...fieldProps }) => {
  const field = useField();
  const { body, form } = useFieldRecordForm(fieldProps);
  const [visible, setVisible] = useState(false);
  const props = field.componentProps;

  return (
    <React.Fragment>
      <Modal
        destroyOnClose
        {...props}
        title={field.title}
        open={visible}
        onCancel={() => {
          return form
            .reset()
            .then(props.onCancel)
            .then(() => setVisible(false));
        }}
        onOk={() => {
          return form
            .submit()
            .then(props.onConfirm)
            .then(() => setVisible(false));
        }}
      >
        {body}
      </Modal>
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
