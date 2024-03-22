import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import { loop, rewite } from "./helper";

const argv = process.argv.slice(2);
const adaptor = argv[0] as "antd" | "antd-v5" | "arco";
const mode = (argv[1] as "build" | "doc") ?? "doc";

if (!/^(antd|antd-v5|arco)$/.test(adaptor)) {
  throw new Error(`适配库${adaptor}不存在`);
}

const byRoot = (x: string) => {
  return path.resolve(__dirname, `../${x}`);
};

const configs = [
  "tsconfig.json",
  "package.json",
  "rspress.config.ts",
  "rsbuild.config.ts",
].map((item) => {
  return byRoot(item);
});

const docs = (() => {
  const list: string[] = [];
  loop(byRoot("docs"), (item) => {
    list.push(item);
  });
  return list;
})();

// [antd, antd-v5, arco]
const list = {
  formily: [`@formily/antd"`, `@formily/antd-v5"`, `arco.formily"`],
  pkg: [`@pro.formily/antd"`, `@pro.formily/antd-v5"`, `@pro.formily/arco"`],
  base: [
    `/pro.formily/antd/"`,
    `/pro.formily/antd-v5/"`,
    `/pro.formily/arco/"`,
  ],
  out: [`/doc_build/antd/"`, `/doc_build/antd-v5/"`, `/doc_build/arco/"`],
  css: [
    "antd/dist/antd.css",
    "antd/dist/reset.css",
    "@arco-design/web-react/dist/css/arco.css",
  ],
  local: [
    "antd/lib/locale/zh_CN",
    "antd/lib/locale/zh_CN",
    "@arco-design/web-react/es/locale/zh-CN",
  ],
  ui: [`"antd"`, `"antd"`, `"@arco-design/web-react"`],
};
const rewriter = (c: string) => {
  let neo = c;
  const idx = adaptor === "antd" ? 0 : adaptor === "antd-v5" ? 1 : 2;
  Object.values(list).forEach((ids) => {
    const maybe = [...ids];
    const [target] = maybe.splice(idx, 1);
    maybe.forEach((id) => {
      neo = neo.replace(id, target);
    });
  });
  return neo;
};

docs
  .filter((x) => /\.(mdx|md|tsx|ts|js|js)$/.test(x))
  .filter((x) => !/install\.mdx/.test(x))
  .forEach((item) => {
    rewite(item, rewriter);
  });

configs.forEach((item) => {
  rewite(item, rewriter);
});

const shadow = byRoot("src/adaptor");
const ui = byRoot(`ui/${adaptor}`);

rimraf.sync(shadow);

// 文档用软连接就好
if (mode === "doc") {
  execSync(`ln -s ${ui} ${shadow}`);
  // rimraf.sync(byRoot("doc_build"));
} else {
  execSync(`cp -R ${ui} ${shadow}`);
}

const pkgPath = byRoot("package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());
const adaptorPkg = JSON.parse(fs.readFileSync(`${ui}/package.json`).toString());

const baseDeps = {
  "@ant-design/icons": "^5.2.6",
  "@formily/core": "^2.3.1",
  "@formily/react": "^2.3.1",
  "@formily/reactive": "^2.3.1",
  "@formily/shared": "^2.3.1",
  ahooks: "^3.7.8",
  moment: "^2.30.1",
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  "react-resizable": "^3.0.5",
};

pkg.dependencies = {
  ...baseDeps,
  ...adaptorPkg.dependencies,
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");

rimraf.sync(byRoot("node_modules"));

execSync("bun i");
