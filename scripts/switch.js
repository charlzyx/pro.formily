const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const adaptor = argv[0];
const mode = argv[1];
const rmrf = require("rimraf");

if (!/antd|antd-v5/.test(adaptor)) {
  throw new Error(`适配库${adaptor}不存在`);
}

const rewite = (filePath, writer) => {
  const old = fs.readFileSync(filePath).toString();
  const neo = writer(old);
  if (neo === old) return;
  fs.writeFileSync(filePath, neo);
};

const files = ["tsconfig.json", "package.json", "rspress.config.ts"].map(
  (item) => {
    return path.resolve(__dirname, `../${item}`);
  },
);

const loop = (filepath, it) => {
  if (fs.existsSync(filepath)) {
    const isDir = fs.statSync(filepath).isDirectory();
    if (isDir) {
      fs.readdirSync(filepath).forEach((sub) => {
        loop(path.join(filepath, sub), it);
      });
    } else {
      it(path.join(filepath));
    }
  }
};

const docs = () => {
  const list = [];
  loop(path.join(__dirname, "../docs"), (item) => {
    list.push(item);
  });
  return list;
};

const replaeer = (c) => {
  if (adaptor === "antd") {
    return c
      .replace(`@formily/antd-v5"`, `@formily/antd"`)
      .replace(`@proformily/antd-v5"`, `@proformily/antd"`)
      .replace(`proformily-antd-v5"`, `proformily-antd"`)
      .replace("antd/dist/reset.css", "antd/dist/antd.css");
  } else {
    return c
      .replace(`@formily/antd"`, `@formily/antd-v5"`)
      .replace(`@proformily/antd"`, `@proformily/antd-v5"`)
      .replace(`proformily-antd"`, `proformily-antd-v5"`)
      .replace("antd/dist/antd.css", "antd/dist/reset.css");
  }
};
docs()
  .filter((x) => /\.(mdx|md|tsx|ts|js|js)$/.test(x))
  .forEach((item) => {
    rewite(item, replaeer);
  });

files.forEach((item) => {
  rewite(item, replaeer);
});

const shadow = path.resolve(__dirname, "../src/adaptor");
const ui = path.resolve(__dirname, `../ui/${adaptor}`);

rmrf.sync(shadow);

// 开发用软连接就好了
if (mode === "dev") {
  execSync(`rm -rf ${shadow}`);
  execSync(`ln -s ${ui} ${shadow}`);
} else {
  execSync(`rm -rf ${shadow}`);
  execSync(`cp -R ${ui} ${shadow}`);
  rmrf.sync(path.resolve(__dirname, "../node_modules"));
  rmrf.sync(path.resolve(__dirname, "../doc_build"));
}
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath));
const adaptorPkg = JSON.parse(fs.readFileSync(`${ui}/package.json`));

const deps = {
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

// sed -i 's/@proformily\/antd/@proformily\/antd-v5/g' *

pkg.dependencies = {
  ...deps,
  ...adaptorPkg.dependencies,
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
rmrf.sync(path.resolve(__dirname, "../node_modules"));

rmrf.sync(path.resolve(__dirname, "../doc_build"));
execSync("bun i");
console.log("ready for --", adaptor);
