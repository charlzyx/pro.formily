import { ArrayField, Field } from "@formily/core";
import { useForm } from "@formily/react";
import { clone } from "@formily/shared";
import { TableProps } from "antd";
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { noop } from "src/__builtins__";

type TableChangeParams = Parameters<Required<TableProps<any>>["onChange"]>;

export type IQueryListParams<Params = any> = {
  pagination?: TableChangeParams[0];
  filters?: TableChangeParams[1];
  sorter?: TableChangeParams[2];
  extra?: TableChangeParams[3];
  params?: Params;
};
const defaultQueryListParams: IQueryListParams = {
  extra: {} as any,
  filters: {},
  pagination: {},
  params: {},
  sorter: {},
};

export interface IQueryListProps<Record = any, Params = any> {
  /** 查询请求, Promise */
  service?: (params: Params) => Promise<{
    list: Record[];
    total: number;
  }>;
  /** 首次自动刷新 */
  autoload?: boolean;
  /** 是否将查询参数同步到url上 */
  syncUrl?: boolean;
}

export interface IQueryListContext extends IQueryListProps {
  /** 是否存在 Context */
  none: boolean;
  loading: boolean;
  /** query field  */
  query?: Field;
  /** table field  */
  table?: ArrayField;
  /** 设置两个固定字段地址 */
  setAddress: (address: string, of: "table" | "query") => void;
  /** 设置查询参数 */
  memo: React.MutableRefObject<{
    init: IQueryListParams;
    data: IQueryListParams;
  }>;
  /** 调用查询 */
  run: () => void;
  /** 重置表单并刷新 */
  reset: () => void;
}

const QueryListContext = createContext<IQueryListContext>({
  none: true,
  memo: { current: { data: {}, init: {} } },
  setAddress: noop,
  loading: false,
  autoload: false,
  run: noop,
  reset: noop,
});

export const useQueryListContext = () => {
  return useContext(QueryListContext);
};

export const QueryList = React.memo<React.PropsWithChildren<IQueryListProps>>(
  ({ children, ...props }) => {
    const memo = useRef({
      init: clone(defaultQueryListParams),
      data: clone(defaultQueryListParams),
    });

    const form = useForm();

    const [loading, setLoading] = useState(false);
    const address = useRef({
      query: "",
      table: "",
    });

    const methods = useMemo(() => {
      return {
        setAddress(addr, of) {
          if (!addr) return;
          if (of === "query") {
            address.current.query = addr;
          } else of === "table";
          {
            address.current.table = addr;
          }
        },
        reset() {
          memo.current.data = clone(memo.current.init);
          // Promise.all 可以处理 undefined, 好评
          return Promise.all([
            this.query?.reset?.(),
            // table 重置分页即可
            this.table?.componentProps?.pagination?.reset?.(),
          ]).then(() => {
            return this.run();
          });
        },
        run() {
          return new Promise((resolve) => {
            // next tick
            setTimeout(resolve);
          }).then(() => {
            setLoading(true);
            return (this as IQueryListContext)
              .service?.(memo.current.data)
              .then((resp) => {
                setLoading(false);
                this.table?.setValue(resp.list ?? []);
                if (this.table?.componentProps?.pagination) {
                  this.table.componentProps.pagination.total = resp.total;
                }
                return resp;
              })
              .catch((e) => {
                throw e;
              })
              .finally(() => {
                setLoading(false);
              });
          });
        },
      } as Omit<IQueryListContext, "memo" | "none" | "loading">;
    }, []);

    const ctx = useMemo(() => {
      const merge = {
        ...props,
        none: false,
        loading,
        memo,
        get query() {
          return form.query(address.current.query).take();
        },
        get table() {
          return form.query(address.current.table).take();
        },
        ...methods,
      } as IQueryListContext;
      return merge;
    }, [props, loading, methods, form]);

    return (
      <QueryListContext.Provider value={ctx}>
        {children}
      </QueryListContext.Provider>
    );
  },
);
