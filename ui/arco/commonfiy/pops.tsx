import {
  Drawer as ArcoDrawer,
  Modal as ArcoModal,
  Popconfirm as ArcoPopconfirm,
} from "@arco-design/web-react";
import React from "react";

export type DrawerProps = Omit<
  React.ComponentProps<typeof ArcoDrawer>,
  "visible" | "afterClose"
> & {
  open?: React.ComponentProps<typeof ArcoDrawer>["visible"];
  onClose?: React.ComponentProps<typeof ArcoDrawer>["afterClose"];
  destroyOnClose?: React.ComponentProps<typeof ArcoModal>["unmountOnExit"];
  size?: "large";
};

export const Drawer = ({
  open,
  destroyOnClose,
  onClose,
  ...props
}: DrawerProps) => {
  return (
    <ArcoDrawer
      {...props}
      visible={open}
      afterClose={onClose}
      unmountOnExit={destroyOnClose}
    >
      {props.children}
    </ArcoDrawer>
  );
};

export type ModalProps = Omit<
  React.ComponentProps<typeof ArcoModal>,
  "visible"
> & {
  open?: React.ComponentProps<typeof ArcoModal>["visible"];
  destroyOnClose?: React.ComponentProps<typeof ArcoModal>["unmountOnExit"];
};

export const Modal = ({
  open,
  destroyOnClose,
  ...props
}: React.PropsWithChildren<ModalProps>) => {
  return (
    <ArcoModal {...props} visible={open} unmountOnExit={destroyOnClose}>
      {props.children}
    </ArcoModal>
  );
};

Object.assign(Modal, ArcoModal);

export type PopconfirmProps = Omit<
  React.ComponentProps<typeof ArcoPopconfirm>,
  "visible" | "onOk" | "onConfirm"
> & {
  open?: React.ComponentProps<typeof ArcoPopconfirm>["popupVisible"];
  onConfirm?: React.ComponentProps<typeof ArcoPopconfirm>["onOk"];
  onOpenChange?: React.ComponentProps<typeof ArcoPopconfirm>["onVisibleChange"];
  destroyTooltipOnHide?: React.ComponentProps<
    typeof ArcoPopconfirm
  >["unmountOnExit"];
};

export const Popconfirm = ({
  open,
  onOpenChange,
  onConfirm,
  destroyTooltipOnHide,
  title,
  ...props
}: React.PropsWithChildren<PopconfirmProps>) => {
  return (
    <ArcoPopconfirm
      {...props}
      onOk={onConfirm}
      content={title}
      popupVisible={open}
      unmountOnExit={destroyTooltipOnHide}
      onVisibleChange={onOpenChange}
    >
      {props.children}
    </ArcoPopconfirm>
  );
};
