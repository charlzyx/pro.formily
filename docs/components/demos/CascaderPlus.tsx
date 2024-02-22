import { Button, Divider, Space } from "antd";
import { CascaderPlus } from "@pro.formily/antd";
import React, { useEffect, useState } from "react";
import localtionList from "china-location/dist/location.json";

export interface OptionData {
  label?: string;
  value?: string | number;
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

export const loadAll = () => {
  return fake()
    .then((origin) => flat(origin))
    .then(({ tree }) => buildTree(tree));
};
export const getById = (parent?: React.Key) => {
  return fake()
    .then((origin) => flat(origin))
    .then(({ flatten }) => {
      return flatten.filter((x) => x.parent === parent);
    });
};
export const loadData = (
  values: Array<number | string>,
): Promise<OptionData[]> => {
  const last = values[values.length - 1];
  return getById(last).then((opts) =>
    opts.map((item) => {
      return {
        value: item.code,
        label: item.name,
        // 需要给出叶子条件, 这里我们是省市区3级, 所以keys长度是2时候就到最后一级别了
        isLeaf: values.length === 2,
      };
    }),
  );
};

export const LinkageDemo1 = () => {
  const [value, setValue] = useState([]);
  const [mul, setMul] = useState(false);
  const [all, setAll] = useState(false);
  const [labelInValue, setLabelInValue] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(1);

  useEffect(() => {
    setValue([]);
    setForceUpdateKey((x) => x + 1);
  }, [mul, labelInValue, all]);
  const onChange = (v: any) => {
    console.log("🚀 ~ onChange ~ v:", v);
    setValue(v);
  };
  useEffect(() => {
    console.log("🚀 ~ Linkage ~ value:", value);
  }, [value]);
  return (
    <div>
      <Space style={{ marginBottom: "10px" }}>
        <Button
          size="small"
          type={all ? "primary" : "default"}
          onClick={() => setAll(true)}
        >
          全量加载
        </Button>
        <Button
          size="small"
          type={!all ? "primary" : "default"}
          onClick={() => setAll(false)}
        >
          懒加载
        </Button>
        <Button
          size="small"
          type={mul ? "primary" : "default"}
          onClick={() => setMul(true)}
        >
          多选
        </Button>
        <Button
          size="small"
          type={!mul ? "primary" : "default"}
          onClick={() => setMul(false)}
        >
          !多选
        </Button>
        <Button
          size="small"
          type={labelInValue ? "primary" : "default"}
          onClick={() => setLabelInValue(true)}
        >
          labeInValue
        </Button>
        <Button
          size="small"
          type={!labelInValue ? "primary" : "default"}
          onClick={() => setLabelInValue(false)}
        >
          !labelInValue
        </Button>
      </Space>
      <div>
        <CascaderPlus
          key={forceUpdateKey}
          value={value}
          onChange={onChange}
          all={all}
          loadData={all ? (loadAll as any) : loadData}
          multiple={mul}
          labelInValue={labelInValue}
        ></CascaderPlus>
      </div>
    </div>
  );
};
export const LinkageDemo2 = () => {
  const [value, setValue] = useState(["110000", "11000000", "110105"]);
  const [mValue, setMValue] = useState([
    ["110000", "11000000", "110105"],
    ["410000", "410600", "410621"],
  ]);
  const [mul, setMul] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(1);

  useEffect(() => {
    setForceUpdateKey((x) => x + 1);
  }, [mul]);
  const onChange = (v: any) => {
    console.log("🚀 ~ onChange ~ v:", v);
    if (mul) {
      setMValue(v);
    } else {
      setValue(v);
    }
  };

  useEffect(() => {
    console.log("🚀 ~ Linkage ~ value:", value);
  }, [value]);
  return (
    <div>
      <Space style={{ marginBottom: "10px" }}>
        <Button
          size="small"
          type={mul ? "primary" : "default"}
          onClick={() => setMul(true)}
        >
          多选
        </Button>
        <Button
          size="small"
          type={!mul ? "primary" : "default"}
          onClick={() => setMul(false)}
        >
          !多选
        </Button>
      </Space>
      <div>
        <CascaderPlus
          key={forceUpdateKey}
          value={mul ? mValue : value}
          multiple={mul}
          onChange={onChange}
          loadData={loadData as any}
        ></CascaderPlus>
      </div>
    </div>
  );
};

export const LinkageDemo3 = () => {
  const [value, setValue] = useState([
    {
      label: "北京市",
      value: "110000",
    },
    {
      label: "北京市",
      value: "11000000",
    },
    {
      label: "朝阳区",
      value: "110105",
    },
  ]);
  const [mValue, setMValue] = useState([
    [
      {
        label: "北京市",
        value: "110000",
      },
      {
        label: "北京市",
        value: "11000000",
      },
      {
        label: "朝阳区",
        value: "110105",
      },
    ],
    [
      {
        label: "河南省",
        value: "410000",
      },
      {
        label: "鹤壁市",
        value: "410600",
      },
      {
        label: "浚县",
        value: "410621",
      },
    ],
  ]);
  const [mul, setMul] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(1);

  useEffect(() => {
    setForceUpdateKey((x) => x + 1);
  }, [mul]);
  const onChange = (v: any) => {
    console.log("🚀 ~ onChange ~ v:", v);
    if (mul) {
      setMValue(v);
    } else {
      setValue(v);
    }
  };

  useEffect(() => {
    console.log("🚀 ~ Linkage ~ value:", value);
  }, [value]);
  return (
    <div>
      <Space style={{ marginBottom: "10px" }}>
        <Button
          size="small"
          type={mul ? "primary" : "default"}
          onClick={() => setMul(true)}
        >
          多选
        </Button>
        <Button
          size="small"
          type={!mul ? "primary" : "default"}
          onClick={() => setMul(false)}
        >
          !多选
        </Button>
      </Space>
      <div>
        <CascaderPlus
          key={forceUpdateKey}
          value={mul ? mValue : value}
          multiple={mul}
          labelInValue
          onChange={onChange}
          loadData={loadData as any}
        ></CascaderPlus>
      </div>
    </div>
  );
};
export default () => {
  return (
    <div>
      <Divider orientation="left">基本属性</Divider>
      <LinkageDemo1></LinkageDemo1>
      <Divider orientation="left">Lazy Load 反显</Divider>
      <LinkageDemo2></LinkageDemo2>
      <Divider orientation="left">Lazy Load & labelInValue 反显</Divider>
      <LinkageDemo3></LinkageDemo3>
    </div>
  );
};
