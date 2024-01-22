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

export interface IShadowFormContext {
  schema: ISchema;
  act: string;
  form: ReturnType<typeof createForm>;
  SchemaField: ReturnType<typeof createSchemaField>;
}
export const ShadowFormContext = createContext<IShadowFormContext>({
  act: "",
  schema: {},
  form: createForm(),
  SchemaField: createSchemaField(),
});

export const ShadowForm: React.FC<
  React.PropsWithChildren<{
    schema: ISchema;
    schemaFieldOptions?: Parameters<typeof useShadowSchemaField>[0];
    act?: string;
    form?: ReturnType<typeof createForm>;
  }>
> = ({ children, act, schemaFieldOptions, form, schema }) => {
  const SchemaField = useShadowSchemaField(schemaFieldOptions);
  const realForm = form ?? createForm({});
  const myField = useFieldSchema();
  const name = myField?.name as string;

  return (
    <ShadowFormContext.Provider
      value={{
        form: realForm,
        schema,
        SchemaField,
        act: act ?? name,
      }}
    >
      {children}
    </ShadowFormContext.Provider>
  );
};
