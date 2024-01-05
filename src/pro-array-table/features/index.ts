import { Form, isArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { FEATURE_KEY as FeatureExpandable, useExpandle } from "./expandable";
import { FEATURE_KEY as FeaturePagination, usePagination } from "./pagination";
import {
	FEATURE_KEY as FeatureProSettings,
	useProSettings,
} from "./pro-settings";

import { autorun, observe, toJS } from "@formily/reactive";
import { useEffect, useRef, useState } from "react";
import {
	FEATURE_KEY as FeatureRowSelection,
	useRowSelection,
} from "./row-selection";

const useArrayFieldData = (dataKey: string, pattern?: string) => {
	const form = useForm();
	const field = useField();

	let arrayField = pattern ? form.query(pattern).take() : field;

	while (arrayField && !isArrayField(arrayField)) {
		arrayField = arrayField.parent;
	}
	const ans = arrayField?.data?.[dataKey];

	return ans;
};

export const useArrayPagination = (pattern?: string) => {
	return useArrayFieldData(FeaturePagination, pattern) as ReturnType<
		typeof usePagination
	>[0];
};
export const useArrayRowSelection = (pattern?: string) => {
	return useArrayFieldData(FeatureRowSelection, pattern) as ReturnType<
		typeof useRowSelection
	>;
};
export const useArrayExpandle = (pattern?: string) => {
	return useArrayFieldData(FeatureExpandable, pattern) as ReturnType<
		typeof useExpandle
	>;
};
export const useArrayProSettings = (pattern?: string) => {
	return useArrayFieldData(FeatureProSettings, pattern) as ReturnType<
		typeof useProSettings
	>[0];
};
