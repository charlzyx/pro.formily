import { Schema } from "@formily/json-schema";
import { ReactFC } from "@formily/react";
import cls from "classnames";
import React from "react";
import {
	SortableContainer,
	SortableElement,
	usePrefixCls,
} from "../../__builtins__";

export const SortableRow = SortableElement((props) => <tr {...props} />);

export const SortableBody = SortableContainer((props) => <tbody {...props} />);

export const RowComp: ReactFC<React.HTMLAttributes<HTMLTableRowElement>> = (
	props,
) => {
	const prefixCls = usePrefixCls("formily-array-table");
	const index = (props as any)["data-row-key"] || 0;
	return (
		<SortableRow
			lockAxis="y"
			{...props}
			index={index}
			className={cls(props.className, `${prefixCls}-row-${index + 1}`)}
		/>
	);
};
const addTdStyles = (
	id: number,
	ref: React.MutableRefObject<HTMLDivElement | null>,
	prefixCls: string,
) => {
	const node = ref.current?.querySelector(`.${prefixCls}-row-${id}`);
	const helper = ref.current?.querySelector(`.${prefixCls}-sort-helper`);
	if (helper) {
		const tds = node?.querySelectorAll("td");
		if (tds) {
			requestAnimationFrame(() => {
				helper.querySelectorAll("td").forEach((td, index) => {
					if (tds[index]) {
						td.style.width = getComputedStyle(tds[index]).width;
					}
				});
			});
		}
	}
};
export const getWrapperComp = (opts: {
	list: any[];
	start: number;
	prefixCls: string;
	onSortEnd: (oldIndex: number, newIndex: number) => void;
	ref: React.MutableRefObject<HTMLDivElement | null>;
}) => {
	const WrapperSortableBody = React.memo(
		(props: React.HTMLAttributes<HTMLTableSectionElement>) => {
			const { list, start, onSortEnd, ref, prefixCls } = opts;
			return (
				<SortableBody
					{...props}
					accessibility={{
						container: ref.current || undefined,
					}}
					start={start}
					list={list}
					onSortStart={(event) => {
						addTdStyles(event.active.id as number, ref, prefixCls);
					}}
					onSortEnd={(event) => {
						const { oldIndex, newIndex } = event;
						window.requestAnimationFrame(() => {
							onSortEnd(oldIndex, newIndex);
						});
					}}
					className={cls(`${prefixCls}-sort-helper`, props.className)}
				>
					{props.children}
				</SortableBody>
			);
		},
	);
	return WrapperSortableBody;
};
