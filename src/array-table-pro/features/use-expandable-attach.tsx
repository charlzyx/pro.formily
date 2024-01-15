import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import { useEffect } from "react";
import { useExpandRender } from "../hooks";
import { ArrayTableProProps } from "../types";

export type IExpandableProps = Required<ArrayTableProProps>["expandable"] & {};

type GetParamsAt<T extends 0 | 1 | 2 | 3 | 4> = Parameters<
  Required<IExpandableProps>["expandedRowRender"]
>[T];

function expandedSchameRowRender(
  record: GetParamsAt<0>,
  index: GetParamsAt<1>,
  indent: GetParamsAt<2>,
  expanded: GetParamsAt<3>,
) {
  const expand = useExpandRender(index);
  return expand;
}
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

      $expand.defaultExpandedRowKeys = $expand.expandedRowKeys ?? [];
      $expand.expandedRowRender =
        $expand.expandedRowRender ?? (expandedSchameRowRender as any);

      console.debug(
        `feature of ${array.address.toString()}:expandable turn on.`,
      );
    });
  }, [array]);
};
