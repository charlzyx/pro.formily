import { ArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { model, toJS } from "@formily/reactive";
import { clone } from "@formily/shared";
import { TableColumnType, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { useEffect, useMemo, useRef, useState } from "react";

export type IProTableColumnProps = TableColumnType<any> & {
	show?: boolean;
};

export type IProSettings = {
	size?: TableProps<any>["size"];
	indentSize?: TableProps<any>["indentSize"];
	columns: IProTableColumnProps[];
	paginationPosition:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
	reset: () => void;
};

export const getPostion = (
	pos: IProSettings["paginationPosition"],
): React.CSSProperties["justifyContent"] => {
	return /center/.test(pos)
		? "center"
		: /left/.test(pos)
		  ? "flex-start"
		  : "flex-end";
};

export const useProSettings = (
	columns: React.MutableRefObject<ColumnType<any>[]>,
	props: TableProps<any>,
) => {
	const [settings, setSettings] = useState<IProSettings>({
		size: "small",
		indentSize: props?.indentSize,
		columns: [],
		paginationPosition: "bottom-right",
		reset() {
			setSettings((pre) => {
				return {
					...pre,
					columns: clone(columns.current).map((item: TableColumnType<any>) => {
						return {
							...item,
							show: true,
						} as IProTableColumnProps;
					}),
				};
			});
		},
	});

	useEffect(() => {
		if (columns.current.length !== settings.columns.length) {
			settings.reset();
		}
	}, [columns.current]);

	const computedColumns = useMemo(() => {
		return settings.columns.filter((x) => x.show);
	}, [settings.columns]);

	return [settings, computedColumns, setSettings] as const;
};
