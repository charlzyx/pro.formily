import { FormGrid } from "@formily/antd";
import type React from "react";
import { useMemo } from "react";

export const useGrid = (conf: React.ComponentProps<typeof FormGrid> = {}) => {
  const maxRows = conf.maxRows || 2;
  const grid = useMemo(() => {
    return FormGrid.createFormGrid({
      maxColumns: conf.maxColumns || 4,
      maxWidth: conf.maxWidth || 320,
      maxRows,
      shouldVisible: (node, myGrid) => {
        if (node.index === grid.childSize - 1) return true;
        if (myGrid.maxRows === Infinity) return true;
        return node.shadowRow! < maxRows + 1;
      },
    });
  }, [conf.maxColumns, conf.maxWidth, maxRows]);

  const computeRows = grid.fullnessLastColumn
    ? grid.shadowRows - 1
    : grid.shadowRows;

  const expanded =
    computeRows <= maxRows ? undefined : grid.maxRows === Infinity;

  const toggle = () => {
    if (grid.maxRows === Infinity) {
      grid.maxRows = maxRows;
    } else {
      grid.maxRows = Infinity;
    }
  };

  return {
    grid,
    expanded,
    toggle,
  };
};
