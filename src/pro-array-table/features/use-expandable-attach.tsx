import { ArrayField } from "@formily/core";
import { RecursionField, useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import { Table } from "antd";
import { useEffect } from "react";
import { ArrayBase } from "../array-base";

export type IExpandableProps = Exclude<
  Required<React.ComponentProps<typeof Table>>["expandable"],
  boolean
> & {};

type GetParamsAt<T extends 0 | 1 | 2 | 3 | 4> = Parameters<
  Required<IExpandableProps>["expandedRowRender"]
>[T];

export const useExpandableAttach = () => {
  const array = useField<ArrayField>();
  useEffect(() => {
    array.setState((s) => {
      if (!s.componentProps) {
        s.componentProps = {};
      }
      if (s.componentProps?.expandable === true) {
        s.componentProps.expandable = {};
      }
      const $expand: IExpandableProps = s.componentProps?.expandable;
      if (!$expand) return;
      const _onExpandRowsChange = $expand?.onExpandedRowsChange;
      const maybeSchame = $expand.expandedRowRender as any;
      const expandedRowRender =
        typeof $expand.expandedRowRender === "function"
          ? null
          : $expand.expandedRowRender
            ? function expandedSchameRowRender(
                record: GetParamsAt<0>,
                index: GetParamsAt<1>,
                indent: GetParamsAt<2>,
                expanded: GetParamsAt<3>,
              ) {
                console.log(
                  "record",
                  maybeSchame,
                  expanded,
                  index,
                  array.path.toString(),
                  array.value?.[index],
                );
                return (
                  <ArrayBase.Item
                    key={expanded ? `expand-${new Date()}` : `hidden-${index}`}
                    index={index}
                    record={array.value?.[index]}
                  >
                    <div
                      style={{
                        paddingLeft: `${indent}px`,
                      }}
                    >
                      <RecursionField
                        schema={maybeSchame}
                        name={index}
                        onlyRenderProperties
                      ></RecursionField>
                    </div>
                  </ArrayBase.Item>
                );
              }
            : null;
      const override: IExpandableProps = {
        expandedRowKeys: [],
        onExpandedRowsChange(expandedKeys) {
          $expand.expandedRowKeys = expandedKeys;
          if (_onExpandRowsChange) {
            _onExpandRowsChange(expandedKeys);
          }
        },
      };

      Object.keys(override).forEach((k) => {
        ($expand as any)[k] = ($expand as any)[k] || toJS((override as any)[k]);
      });
      $expand.expandedRowRender = expandedRowRender as any;

      console.debug(
        `feature of ${array.address.toString()}:expandable turn on.`,
      );
    });
  }, [array]);
};
