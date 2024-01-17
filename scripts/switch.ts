import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import { loop, rewite } from "./helper";

const argv = process.argv.slice(2);
const adaptor = argv[0] as "antd" | "antd-v5";
const mode = (argv[1] as "build" | "doc") ?? "doc";

if (!/antd|antd-v5/.test(adaptor)) {
  throw new Error(`适配库${adaptor}不存在`);
}

const byRoot = (x: string) => {
  return path.resolve(__dirname, `../${x}`);
};

const configs = ["tsconfig.json", "package.json", "rspress.config.ts"].map(
  (item) => {
    return byRoot(item);
  },
);

const docs = (() => {
  const list: string[] = [];
  loop(byRoot("docs"), (item) => {
    list.push(item);
  });
  return list;
})();

const rewriter = (c: string) => {
  if (adaptor === "antd") {
    return c
      .replace(`@formily/antd-v5"`, `@formily/antd"`)
      .replace(`@proformily/antd-v5"`, `@proformily/antd"`)
      .replace(`/pro.formily/antd-v5/"`, `/pro.formily/antd/"`)
      .replace(`/doc_build/antd-v5"`, `/doc_build/antd"`)
      .replace("antd/dist/reset.css", "antd/dist/antd.css");
  } else {
    return c
      .replace(`@formily/antd"`, `@formily/antd-v5"`)
      .replace(`@proformily/antd"`, `@proformily/antd-v5"`)
      .replace(`proformily-antd"`, `proformily-antd-v5"`)
      .replace(`/pro.formily/antd/"`, `/pro.formily/antd-v5/"`)
      .replace(`/doc_build/antd"`, `/doc_build/antd-v5"`)
      .replace("antd/dist/antd.css", "antd/dist/reset.css");
  }
};

docs
  .filter((x) => /\.(mdx|md|tsx|ts|js|js)$/.test(x))
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
  rimraf.sync(byRoot("doc_build"));
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
