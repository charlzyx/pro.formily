import { createForm } from "@formily/core";
import {
  ISchema,
  SchemaOptionsContext,
  createSchemaField,
  useFieldSchema,
} from "@formily/react";
import React, { createContext, useContext } from "react";

export const useShadowSchemaField = (
  schemaFieldOptions?: Parameters<ReturnType<typeof createSchemaField>>[0],
) => {
  const inside = useContext(SchemaOptionsContext);

  const SchemaField = createSchemaField({
    ...(schemaFieldOptions || {}),
    components: {
      ...(schemaFieldOptions?.components ?? {}),
      ...inside.components,
    },
    scope: { ...(schemaFieldOptions?.scope ?? {}), ...inside.scope },
  });
  return SchemaField;
};

export interface IShadowFormOptions {
  /** 子表单对应动作名称 */
  act: string;
  /** 子表单Schema */
  schema: ISchema;
  /** createSchemaField 函数配置, components 和 scope */
  schemaFieldOptions?: Parameters<typeof useShadowSchemaField>[0];
  /** createForm 创建的表单实例, 有自定义 effects 等可以通过自定义一个 form 这个传入 */
  form?: ReturnType<typeof createForm>;
}
export interface IShadowFormContext
  extends Required<Omit<IShadowFormOptions, "schemaFieldOptions">> {
  SchemaField: ReturnType<typeof createSchemaField>;
}
export const ShadowFormContext = createContext<IShadowFormContext>({
  act: "",
  schema: {},
  form: createForm(),
  SchemaField: createSchemaField(),
});

export const useShadowForm = (options: {
  schema: ISchema;
  schemaFieldOptions?: Parameters<typeof useShadowSchemaField>[0];
  act?: string;
  form?: ReturnType<typeof createForm>;
}) => {
  const { schema, schemaFieldOptions, act, form } = options;
  const SchemaField = useShadowSchemaField(schemaFieldOptions);
  const realForm = form ?? createForm({});
  const myField = useFieldSchema();
  const name = myField?.name as string;
  return {
    form: realForm,
    schema,
    SchemaField,
    act: act ?? name,
  };
};

export const ShadowFormProvider: React.FC<
  React.PropsWithChildren<{
    schema: ISchema;
    schemaFieldOptions?: Parameters<typeof useShadowSchemaField>[0];
    act?: string;
    form?: ReturnType<typeof createForm>;
  }>
> = ({ children, ...options }) => {
  const { SchemaField, act, form, schema } = useShadowForm(options);

  return (
    <ShadowFormContext.Provider
      value={{
        form,
        schema,
        SchemaField,
        act: act ?? name,
      }}
    >
      {children}
    </ShadowFormContext.Provider>
  );
};
