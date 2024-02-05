# 💎 Formily, Pro！

|                      |                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| @pro.formily/antd    | [![version](https://badgen.net/npm/v/@pro.formily/antd?last)](https://www.npmjs.com/package/@pro.formily/antd)       |
| @pro.formily/antd-v5 | [![version](https://badgen.net/npm/v/@pro.formily/antd-v5?last)](https://www.npmjs.com/package/@pro.formily/antd-v5) |
| @pro.formily/arco    | [![version](https://badgen.net/npm/v/@pro.formily/arco?last)](https://www.npmjs.com/package/@pro.formily/arco)       |

为 formily 宇宙添加的开箱即用的高级组件库, antd@4,5/arco.design 三大 UI 库版本适配

- 📋 **案例丰富** 练习时长两年半积累下来的丰富 Demo, 方便 cv
- 🐙 **原汁原味** 尽可能符合 AntD × formily 设计规范与直觉
- 🚀 **拓展强大** 查询表单/多选/行展开/枚举词典等实用拓展

![welcome](./docs/public/welcome.png)

# 如何安装

> antd@v4

`bun i @pro.formily/antd @formily/antd @fomrily/core @formily/react antd@4.x @ant-design/icons`

> antd@v5

`bun i @pro.formily/antd @formily/antd-v5 @fomrily/core @formily/react antd@5.x @ant-design/icons`

> arco.design

`bun i @pro.formily/arco arco.formily @fomrily/core @formily/react @arco-design/web-react`

## 样式 TODO

## 在线文档地址

[for/antd@4](https://charlzyx.github.io/pro.formily/antd/)

[for/antd@5](https://charlzyx.github.io/pro.formily/antd-v5/)

[for/arco.design](https://charlzyx.github.io/pro.formily/arco/)

## 如何开发

`bun v4 && bun dev`

```json
{
  "scripts": {
    "dev": "rspress dev",
    "v4": "bun scripts/switch.ts antd doc",
    "v5": "bun scripts/switch.ts antd-v5 doc",
    "arco": "bun scripts/switch.ts arco doc"
  }
}
```

## powered by

- [@formily](https://formilyjs.org)
- [antd@5](https://ant.design/components/table-cn/)
- [antd@4](https://4x.ant.design/components/table-cn/)
- [arco.design](https://arco.design/)
- [@formily/antd](https://github.com/alibaba/formily)
- [@formily/antd-v5](https://github.com/formilyjs/antd)
- [Rspress](https://rspress.dev/)
- [bun!强烈推荐](https://bun.sh/docs)
