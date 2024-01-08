import { Form, GeneralField, isDataField } from "@formily/core";

/**
 * 类似这种,对 array 的 property 赋值会失效, 特此补丁
 * example
 * values: { arr: [1, 2, 3] }
 * setValuesIn(values, 'arr.extends')
 */

export const setValueOf = (form: Form, field: GeneralField, value: any) => {
	if (!isDataField(field)) return;
	field.onInput(value);
	if (value !== field.value) {
		field.path.reduce((target, item, idx) => {
			if (idx === field.path.length - 1) {
				target[item] = value;
			} else {
				return target[item];
			}
		}, form.values);
	}
};
