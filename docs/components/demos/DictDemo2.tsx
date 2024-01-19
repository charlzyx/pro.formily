import { observer } from "@formily/react";
import { dict, registerDictLoader } from "@pro.formily/antd";
import { Button, Space } from "antd";

const loader = registerDictLoader("framework", () => {
  return Promise.resolve([
    { label: "vue", value: 0 },
    { label: "react", value: 1 },
    { label: "solid", value: 2 },
  ]);
});

const LiveDict = observer(() => {
  const emap = dict.framework?.emap;
  // console.log("🚀 ~ LiveDict ~ dict:", dict.framework);
  return (
    <div>
      <div
        onClick={() => {
          // console.log("🚀 ~ LOG dict:", toJS(dict.framework));
        }}
      >
        LOG
      </div>
      <ul>
        <li>
          value: {emap?.vue} , label: {emap?.[0]}
        </li>
        <li>
          value: {emap?.react} , label: {emap?.[1]}
        </li>
        <li>
          value: {emap?.solid} , label: {emap?.[2]}
        </li>
      </ul>
    </div>
  );
});

const Loader = () => {
  return (
    <Button
      onClick={() =>
        loader().then((framworks) => {
          console.log("got it ", framworks);
        })
      }
    >
      点击加载
    </Button>
  );
};

export default () => {
  return (
    <Space>
      <Loader></Loader>
      <div>
        <LiveDict></LiveDict>
      </div>
    </Space>
  );
};
