import { useField } from "@formily/react";
import React, { useState } from "react";
import { Button, Modal, ModalProps } from "../adaptor";
import { RecordFormProps, useFieldRecordForm } from "./hooks";

export const ProModal: React.FC<
  RecordFormProps &
    ModalProps & {
      onCancel: () => void | Promise<void>;
      onConfirm: (data: any) => void | Promise<void>;
    }
> = (props) => {
  const field = useField();
  const { FormBody, form } = useFieldRecordForm(props);
  const [visible, setVisible] = useState(false);

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
        <FormBody></FormBody>
      </Modal>
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
