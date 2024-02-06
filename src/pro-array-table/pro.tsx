import { ArrayField, JSXComponent } from "@formily/core";
import {
  ReactFC,
  RecursionField,
  observer,
  useField,
  useFieldSchema,
} from "@formily/react";
import React, { useContext, useEffect, useRef } from "react";
import {
  Pagination,
  Space,
  Table,
  Typography,
  useResizeHeader,
  useSortableBody,
} from "../adaptor";
import { ArrayBase, usePrefixCls } from "../adaptor/adaptor";
import useStyle from "../adaptor/themes/pro-array-table/useStyle";
import {
  ArrayTableDelegateContext,
  getDelegateInfo,
  isDelegateTarget,
  useDelegate,
} from "./features/delegate";
import { TableExpandableContext, useExpandable } from "./features/expandable";
import {
  IPaginationOptions,
  TablePaginationContext,
  usePagination,
} from "./features/pagination";
import { ProSettings } from "./features/pro-settings";
import {
  TableRowSelectionContext,
  useRowSelection,
} from "./features/row-selection";
import { hasSortable, isColumnComponent } from "./helper";
import {
  useAddition,
  useArrayTableColumns,
  useArrayTableSources,
  useFooter,
  useProArrayTableContext,
  useShadowComponents,
  useToolbar,
} from "./hooks";
import {
  Addition,
  Column,
  Copy,
  MoveDown,
  MoveUp,
  Remove,
  RowExpand,
} from "./mixin.base";
import {
  ArrayTableShowModal,
  DelegateAction,
  Flex,
  ProAddition,
  RowSelectionPro,
} from "./mixin.pro";
import { IChangeData, ProArrayTableProps } from "./types";

const ArrayTableProInside: ReactFC<ProArrayTableProps> = observer(
  ({ onAdd, onRemove, onCopy, onMoveDown, onMoveUp, onSortEnd, ...props }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const field = useField<ArrayField>();
    const schema = useFieldSchema();
    const prefixCls = usePrefixCls("formily-array-table-pro");

    const [wrapSSR, hasId] = useStyle(prefixCls);
    const delegateCtx = useDelegate();
    /**
     * 优化笔记：
     * 本来以为这个 slice 没什么用，直到我膝盖中了一箭
     * 联动: useArrayTableSources -> useColumns -> render -> indexOf
     */
    const dataSource = Array.isArray(field.value) ? field.value.slice() : [];
    const sources = useArrayTableSources();

    const [columns, proColumns] = useArrayTableColumns(
      field,
      sources,
      dataSource,
    );

    /** 因为 pagination 被我们重写了， 所以需要很啰嗦的处理一下 */
    const changeData = useRef<IChangeData>({
      pagination: {},
      filters: {},
      sorter: {},
      extra: {} as any,
    });

    const handlePageChange = (
      current: number,
      pageSize: number,
      other: typeof props.pagination,
    ) => {
      if (!props.onTableChange) return;
      changeData.current.pagination = {
        ...other,
        current,
        pageSize,
      };
      props.onTableChange(
        changeData.current.pagination,
        changeData.current.filters,
        changeData.current.sorter,
        changeData.current.extra,
      );
    };

    const [pageCtx, page] = usePagination(
      props.pagination,
      dataSource.length,
      handlePageChange,
    );

    const startIndex = pageCtx ? (pageCtx.current! - 1) * pageCtx.pageSize! : 0;
    const endIndex = pageCtx ? startIndex + pageCtx.pageSize! : 0;

    const dataSlice =
      pageCtx && props.slice !== false
        ? dataSource.slice(startIndex, endIndex)
        : dataSource;

    const addition = useAddition();
    const toolbar = useToolbar();
    const footer = useFooter();
    const shaowPops = useShadowComponents();

    const rowKey = (record: any) => {
      return props.rowKey
        ? typeof props.rowKey === "function"
          ? props.rowKey(record)
          : record?.[props.rowKey as string]
        : dataSource.indexOf(record);
    };

    const rowKeyRef = useRef(rowKey);
    useEffect(() => {
      rowKeyRef.current = rowKey;
    }, [rowKey]);

    const [expandableCtx, expandable] = useExpandable(
      props.expandable,
      dataSlice,
      rowKeyRef,
      pageCtx?.current,
    );

    const [rowSelectionCtx, rowSelection] = useRowSelection(
      props.rowSelection,
      pageCtx?.current,
    );

    let showPage = true;
    if (!page) {
      showPage = false;
    } else if (page.hideOnSinglePage) {
      showPage = (page.pageSize || 0) < (page?.total || 0);
    } else {
      showPage = true;
    }

    const pagination = showPage ? (
      <div>
        <Pagination
          style={{
            padding: "8px 0",
          }}
          {...page}
          disabled={(page as IPaginationOptions)?.disabled ?? !!props.loading}
        ></Pagination>
      </div>
    ) : null;

    const showHeader =
      props.title ||
      props.rowSelection ||
      toolbar ||
      addition ||
      props.settings !== false;

    const _header = !showHeader ? null : (
      <Flex between marginBottom={"6px"} marginTop={"6px"}>
        <Flex start>
          {props.title ? (
            typeof props.title === "function" ? (
              props.title(dataSource)
            ) : (
              <Typography.Title level={5} style={{ flex: 1 }}>
                {props.title}
              </Typography.Title>
            )
          ) : null}
          {rowSelection?.showPro === "top" ? (
            <RowSelectionPro ds={dataSlice} rowKey={rowKey}></RowSelectionPro>
          ) : null}
        </Flex>
        <Flex end>
          {toolbar}
          {addition}
          {!props.extra && props.settings === false ? null : (
            <Space size="small">
              {props.extra}
              {props.settings !== false ? (
                <ProSettings columns={proColumns}></ProSettings>
              ) : null}
            </Space>
          )}
        </Flex>
      </Flex>
    );

    const showFooter = props.footer || footer || pagination;
    const _footer = !showFooter ? null : (
      <Flex between marginTop={`${6}px`}>
        <Flex
          start
          hidden={!props.footer && rowSelection?.showPro !== "bottom"}
        >
          {props.footer ? (
            typeof props.footer === "function" ? (
              props.footer(dataSource)
            ) : (
              <Typography.Title level={5}>{props.footer}</Typography.Title>
            )
          ) : null}
          {rowSelection?.showPro === "bottom" ? (
            <RowSelectionPro ds={dataSlice} rowKey={rowKey}></RowSelectionPro>
          ) : null}
        </Flex>
        <Flex end>
          {footer}
          {pagination}
        </Flex>
      </Flex>
    );

    const header = useResizeHeader({
      enable: props.resizeable,
    });

    const body = useSortableBody(
      dataSource,
      (from, to) =>
        Promise.resolve(onSortEnd?.(from, to, field)).then(() =>
          field.move(from, to),
        ),
      {
        wrapperRef: wrapperRef,
        enable: hasSortable(schema),
        prefixCls,
        start: startIndex,
      },
    );

    const handleDelegate = (e: React.SyntheticEvent) => {
      let target = e.target as HTMLElement;
      while (
        target &&
        target !== wrapperRef.current &&
        !isDelegateTarget(target)
      ) {
        target = target.parentElement as any;
      }
      if (isDelegateTarget(target)) {
        const info = getDelegateInfo(target);
        if (!info) return;
        delegateCtx.setAct({ index: info.index, act: info.act! });
      }
    };

    return wrapSSR(
      <div
        ref={wrapperRef}
        className={`${prefixCls} ${hasId}`}
        onClick={handleDelegate}
      >
        <ArrayTableDelegateContext.Provider value={delegateCtx}>
          <TablePaginationContext.Provider value={pageCtx!}>
            <TableExpandableContext.Provider value={expandableCtx!}>
              <TableRowSelectionContext.Provider value={rowSelectionCtx!}>
                <ArrayBase
                  onAdd={onAdd as any}
                  onCopy={onCopy as any}
                  onMoveDown={onMoveDown as any}
                  onMoveUp={onMoveDown as any}
                  onRemove={onRemove as any}
                >
                  {_header}
                  <Table
                    size={"small"}
                    {...props}
                    rowKey={rowKey}
                    onRow={(row, idx) => {
                      const pre = props?.onRow?.(row, idx) || {};
                      (pre as any)["data-row-sort-index"] = idx;
                      return pre;
                    }}
                    title={undefined}
                    footer={undefined}
                    rowSelection={rowSelection!}
                    expandable={expandable!}
                    // 这里不处理 page 是因为 pagination 被我们重写了
                    onChange={(_page, filters, sorter, extra) => {
                      if (!props.onTableChange) return;
                      changeData.current.filters = filters;
                      changeData.current.sorter = sorter;
                      changeData.current.extra = extra;
                      props.onTableChange(
                        changeData.current.pagination,
                        filters,
                        sorter,
                        extra,
                      );
                    }}
                    pagination={false as any}
                    columns={columns}
                    dataSource={dataSlice}
                    components={{
                      header: {
                        ...props.components?.header,
                        ...header,
                      },
                      body: {
                        ...props.components?.body,
                        ...body,
                      },
                    }}
                  />
                  {_footer}
                  {sources.map((column, key) => {
                    if (!isColumnComponent(column.schema)) return;
                    return React.createElement(RecursionField, {
                      name: column.name,
                      schema: column.schema,
                      onlyRenderSelf: true,
                      key,
                    });
                  })}
                  {shaowPops}
                </ArrayBase>
              </TableRowSelectionContext.Provider>
            </TableExpandableContext.Provider>
          </TablePaginationContext.Provider>
        </ArrayTableDelegateContext.Provider>
      </div>,
    );
  },
);

const useTableExpandable = () => {
  return useContext(TableExpandableContext);
};

const useTableRowSelection = () => {
  return useContext(TableRowSelectionContext);
};

const useTablePagination = () => {
  return useContext(TablePaginationContext);
};

export const ProArrayTable = Object.assign(
  ArrayBase.mixin(ArrayTableProInside),
  {
    Copy,
    MoveUp,
    MoveDown,
    Remove,
    Column,
    Addition,
    ProAddition,
    RowExpand,
    ShadowModal: ArrayTableShowModal,
    DelegateAction,
    useTableExpandable,
    useTableRowSelection,
    useTablePagination,
    useProArrayTableContext,
  },
);

ProArrayTable.displayName = "ProArrayTable";
