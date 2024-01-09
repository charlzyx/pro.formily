import { Form, isArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { observe, toJS } from "@formily/reactive";
import { useEffect, useMemo, useState } from "react";

export type ArrayFeatureNames =
	| "pagination"
	| "rowSelection"
	| "expandable"
	| (string & {});

export const useFormArrayFeature = <T extends Record<string, any>>(
	form: Form,
	pattern: string,
	featureName: ArrayFeatureNames,
): [T, T] => {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
		return () => {
			setMounted(false);
		};
	}, []);

	const array = useMemo(() => {
		return mounted ? form.query(pattern).take() : undefined;
	}, [mounted, pattern]);

	const $feature = array?.componentProps?.[featureName];
	const [feature, setFeature] = useState($feature ? toJS($feature) : undefined);

	useEffect(() => {
		if (!$feature) return;
		const disposer = observe($feature, () => {
			setFeature(toJS($feature));
		});
		return disposer;
	}, [$feature]);

	return [feature, $feature];
};

export const useArrayFeature = <T extends Record<string, any>>(
	featureName: ArrayFeatureNames,
	pattern?: string,
): [T, T] => {
	const form = useForm();
	const field = useField();
	const query = pattern ? form.query(pattern).take() : null;
	let array = query || field;
	while (array && !isArrayField(array)) {
		array = array.parent;
	}
	const $feature = array.componentProps?.[featureName];
	const [feature, setFeature] = useState(toJS($feature));

	useEffect(() => {
		if (!feature) return;
		const disposer = observe($feature, () => {
			setFeature(toJS($feature));
		});
		return disposer;
	}, [$feature]);

	return [feature, $feature];
};
