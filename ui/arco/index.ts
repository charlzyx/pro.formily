import { Grid, PaginationProps } from "@arco-design/web-react";
import "@arco-design/web-react/es/Alert/style/index";
import "@arco-design/web-react/es/Badge/style/index";
import "@arco-design/web-react/es/Button/style/index";
import "@arco-design/web-react/es/Cascader/style/index";
import "@arco-design/web-react/es/Divider/style/index";
import "@arco-design/web-react/es/Drawer/style/index";
import "@arco-design/web-react/es/Grid/style/index";
import "@arco-design/web-react/es/Image/style/index";
import "@arco-design/web-react/es/Modal/style/index";
import "@arco-design/web-react/es/Pagination/style/index";
import "@arco-design/web-react/es/Popconfirm/style/index";
import "@arco-design/web-react/es/Popover/style/index";
import "@arco-design/web-react/es/Select/style/index";
import "@arco-design/web-react/es/Slider/style/index";
import "@arco-design/web-react/es/Space/style/index";
import "@arco-design/web-react/es/Table/style/index";
import "@arco-design/web-react/es/Tag/style/index";
import "@arco-design/web-react/es/Typography/style/index";
import {
  IconCopy,
  IconDelete,
  IconPlus,
  IconSettings,
  IconShrink,
  IconSync,
  IconToTop,
} from "@arco-design/web-react/icon";
import "./themes/index";
export const ColumnHeightOutlined = IconShrink;
export const SettingOutlined = IconSettings;
export const SyncOutlined = IconSync;
export const CopyOutlined = IconCopy;
export const DeleteOutlined = IconDelete;
export const PlusOutlined = IconPlus;
export const ToTopOutlined = IconToTop;

export {
  Badge,
  Button,
  ConfigProvider,
  Divider,
  Grid,
  Image,
  Pagination,
  Popover,
  Select,
  Slider,
  Space,
  Tag,
} from "@arco-design/web-react";
export type { BadgeProps } from "@arco-design/web-react";
export const Row = Grid.Row;

export type { TableProps } from "./commonfiy/table";

export type TablePaginationConfig = PaginationProps;

export const BUTTON_TYPE = "text";

export { Table } from "./commonfiy/table";
export { Alert } from "./commonfiy/alert";
export { Drawer, Modal, Popconfirm } from "./commonfiy/pops";
export { Cascader } from "./commonfiy/cascader";
export { Typography } from "./commonfiy/typography";
