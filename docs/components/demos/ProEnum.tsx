import qs from "qs";
import jsonp from "fetch-jsonp";
import {
  Checkbox,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
  Space,
} from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, createSchemaField } from "@formily/react";
import {
  CascaderPlus,
  Suggestion,
  ProEnum,
  ProEnumPretty,
  useProEnumEffects,
} from "@pro.formily/antd";
import React, { useMemo } from "react";
import localtionList from "china-location/dist/location.json";
import { Button } from "antd";

export interface OptionData {
  label: string;
  value: string | number;
  isLeaf?: boolean;
  children?: OptionData[];
  loading?: boolean;
}

export const flat = (
  json: Record<
    string,
    {
      name: string;
      code: string;
      children?: {
        name: string;
        code: string;
        children?: { name: string; code: string }[];
      }[];
      cities: Record<
        string,
        {
          name: string;
          code: string;
          children?: {
            name: string;
            code: string;
          }[];
          districts: Record<string, string>;
        }
      >;
    }
  >,
) => {
  const flatten: { parent?: string; code: string; name: string }[] = [];

  const tree = Object.values(json).map((province) => {
    flatten.push({ code: province.code, name: province.name });
    province.children = Object.values(province.cities).map((city) => {
      // 拍平的结构要求 parentId 不能重复, 这个数据里面直辖市是一样的, 搞一下
      const cityCode =
        city.code === province.code ? `${city.code}00` : city.code;

      flatten.push({
        code: cityCode,
        name: city.name,
        parent: province.code,
      });
      city.code = cityCode;
      city.children = Object.entries(city.districts).map(([code, name]) => {
        const distCode =
          code === cityCode || code === province.code ? `${code}0000` : code;
        flatten.push({ code: distCode, name, parent: cityCode });
        return { code, name } as any;
      });
      return city;
    });
    return province;
  });
  return { flatten, tree };
};

const buildTree = (parent: ReturnType<typeof flat>["tree"]) => {
  const tree = parent.reduce((root, item) => {
    // item.children =
    const node: OptionData = {
      label: item.name,
      value: item.code,
      isLeaf: !(Array.isArray(item.children) && item.children.length > 0),
    };
    if (!node.isLeaf) {
      node.children = buildTree(item.children as any);
    }
    root.push(node);
    return root;
  }, [] as OptionData[]);
  return tree;
};

const fake = (): Promise<typeof localtionList> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(localtionList);
    }, 500);
  });
};

export const getById = (parent?: React.Key) => {
  return fake()
    .then((origin) => flat(origin))
    .then(({ flatten }) => {
      return flatten.filter((x) => x.parent === parent);
    });
};
export const loadData = (options: OptionData[]): Promise<OptionData[]> => {
  const keys = [undefined, ...options.map((x) => x.value)];
  const last = options[options.length - 1];
  return getById(last?.value).then((opts) =>
    opts.map((item) => {
      return {
        value: item.code,
        label: item.name,
        // 需要给出叶子条件, 这里我们是省市区3级, 所以keys长度是3的时候就到最后一级别了
        isLeaf: keys.length === 3,
      };
    }),
  );
};
const list = [
  {
    label: "啊",
    value: "a",
  },
  {
    label: "哦",
    value: "o",
  },
  {
    label: "呃",
    value: "e",
  },
];
const suggest = (params: object & { kw: string }) => {
  console.log("search params", params);
  const str = qs.stringify({
    code: "utf-8",
    q: params?.kw,
  });
  return jsonp(`https://suggest.taobao.com/sug?${str}`)
    .then((response: any) => response.json())
    .then((d: any) => {
      const { result } = d;
      const data: { label: string; value: string }[] = result.map(
        (item: any) => {
          return {
            value: item[0] as string,
            label: item[0] as string,
          };
        },
      );
      return data;
    });
};

const enums = {
  list: ProEnum.from(list),
  lazyList: ProEnum.from(() => {
    return new Promise((resolve) => {
      console.log(`🚀 ~ request list...:`);
      setTimeout(() => {
        resolve(list);
      }, 1000);
    });
  }),
  suggest: ProEnum.from(suggest, { mapToProp: "suggest" }),
  linkage: ProEnum.from(loadData, { mapToProp: "loadData" }),
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    Radio,
    Checkbox,
    FormGrid,
    FormLayout,
    Space,
    CascaderPlus,
    Suggestion,
    ProEnumPretty,
  },
  scope: {
    enums,
  },
});

type SchemaShape = React.ComponentProps<typeof SchemaField>["schema"];

const schema: SchemaShape = {
  type: "object",
  properties: {
    layout: {
      type: "void",
      "x-decorator": "FormLayout",
      "x-decorator-props": {
        layout: "vertical",
      },
      "x-component": "FormGrid",
      "x-component-props": {
        maxColumns: 2,
        minColumns: 2,
      },
      properties: {
        select: {
          title: "Select",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Select",
          enum: "{{enums.list}}",
          "x-component-props": {
            showType: "badge",
          },
        },
        lazySelect: {
          title: "Lazy Select",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Select",
          enum: "{{enums.lazyList}}",
          "x-component-props": {
            mode: "multiple",
            showType: "tag",
          },
        },
        radio: {
          title: "Radio",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Radio.Group",
          enum: "{{enums.list}}",
        },
        lazyRadio: {
          title: "Lazy Radio",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Radio.Group",
          enum: "{{enums.lazyList}}",
        },
        checkbox: {
          title: "Checkbox",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Checkbox.Group",
          enum: "{{enums.list}}",
        },
        lazyCheckbox: {
          title: "Lazy Checkbox",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Checkbox.Group",
          enum: "{{enums.lazyList}}",
        },
        pretty: {
          title: "ProEnumPretty",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "ProEnumPretty",
          default: ["a", "o"],
          enum: "{{enums.list}}",
        },
        prettybadge: {
          title: "ProEnumPretty Badge",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "ProEnumPretty",
          default: ["a", "o"],
          enum: "{{enums.list}}",
          "x-component-props": {
            showType: "badge",
          },
        },
        prettytag: {
          title: "ProEnumPretty Tag",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "ProEnumPretty",
          default: ["a", "e"],
          enum: "{{enums.list}}",
          "x-component-props": {
            showType: "tag",
          },
        },
        suggest: {
          title: "Suggestion",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Suggestion",
          "x-component-props": {
            placeholder: "查询淘宝商品..",
            multiple: true,
          },
          enum: "{{enums.suggest}}",
          // "x-data": {
          //   proEnum: {
          //     mapToProp: "suggest"
          // }
          // },
        },
        linkage: {
          title: "Linkage",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "CascaderPlus",
          enum: "{{enums.linkage}}",
        },
      },
    },
  },
};

const DictDemo = () => {
  const form = useMemo(() => {
    return createForm({
      effects() {
        useProEnumEffects();
      },
    });
  }, []);
  return (
    <React.Fragment>
      <Space>
        <Button
          onClick={() => {
            form.setPattern("readPretty");
          }}
        >
          READ PRETTY
        </Button>
        <Button
          onClick={() => {
            form.setPattern("editable");
          }}
        >
          EDITABLE
        </Button>
      </Space>
      <FormProvider form={form}>
        <SchemaField schema={schema} />
      </FormProvider>
    </React.Fragment>
  );
};

export default DictDemo;
