import { ProDrawer } from "./Drawer";
import { ProModal } from "./Modal";
import { ProPopconfirm } from "./Popconfirm";
export * from "./hooks";

export const EditablePro = Object.assign(ProPopconfirm, {
  Modal: ProModal,
  Drawer: ProDrawer,
});
