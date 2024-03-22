import { GeneralField, VoidField, createForm } from "@formily/core";
import {
  FormProvider,
  ISchema,
  SchemaComponentsContext,
  SchemaOptionsContext,
  createSchemaField,
  useField,
} from "@formily/react";
import React, { useContext, useMemo } from "react";
import ReactIs from "react-is";

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
  /** 子表单Schema */
  schema: ISchema;
  /** createSchemaField 函数配置, components 和 scope */
  schemaFieldOptions?: Parameters<typeof useShadowSchemaField>[0];
  /** createForm 创建的表单实例, 有自定义 effects 等可以通过自定义一个 form 这个传入 */
  form?: ReturnType<typeof createForm>;
}

export const useShadowForm = (options: IShadowFormOptions) => {
  const { schema, schemaFieldOptions, form } = options;
  const SchemaField = useShadowSchemaField(schemaFieldOptions);
  const realForm = useMemo(() => form ?? createForm({}), [form]);
  return {
    form: realForm,
    schema,
    SchemaField,
  };
};

const role = (field: GeneralField, self: any) => {
  const components = useContext(SchemaComponentsContext);
  const decorator = components[field.decoratorType];
  const component = components[field.componentType];
  const isDecorator = decorator === self;
  const isComponent = component === self;
  return isDecorator ? "decorator" : isComponent ? "component" : null;
};

export interface ShadowFormWrappedProps {
  form: ReturnType<typeof createForm>;
  SchemaField: ReturnType<typeof createSchemaField>;
  schema: ISchema;
}

export const ShadowForm: React.FC<React.PropsWithChildren<IShadowFormOptions>> =
  ({ children, ...props }) => {
    const field = useField<VoidField>();
    const im = role(field, ShadowForm);
    const { SchemaField, form, schema } = useShadowForm(props);

    if (im === "component") {
      // IOC
      field.data = field.data ?? {};
      field.data._form = form;
    }
    const child = // at x-component
      im === "component" ? (
        <FormProvider form={form}>
          <SchemaField schema={schema}></SchemaField>
        </FormProvider>
      ) : // at x-decorator
      ReactIs.isElement(children) ? (
        React.cloneElement(children, {
          ...children.props,
          form,
          SchemaField,
          schema,
        })
      ) : (
        children
      );
    // biome-ignore lint/complexity/noUselessFragments: <explanation>
    return <React.Fragment>{child}</React.Fragment>;
  };
