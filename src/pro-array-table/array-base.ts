import { ArrayBase as AntdArrayBase } from "@formily/antd";
// 类型fix
export const ArrayBase = AntdArrayBase as Required<typeof AntdArrayBase> &
  typeof AntdArrayBase;
