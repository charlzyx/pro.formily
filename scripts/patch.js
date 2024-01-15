const path = require("path");
const fs = require("fs");

const cssPath = path.resolve(
  __dirname,
  "../node_modules/@rspress/theme-default/dist/bundle.css",
);
const rewite = (filePath, writer) => {
  const old = fs.readFileSync(filePath).toString();
  const neo = writer(old);
  if (neo === old) return;
  fs.writeFileSync(filePath, neo);
};
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

const css = () => {
  const list = [];
  loop(path.join(__dirname, "../doc_build"), (item) => {
    if (/\.css$/.test(item)) {
      rewite(item, (style) => {
        return style.replace("background-color:transparent;", "");
      });
    }
  });
  return list;
};

css();

if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf-8").toString();
  const neo = css.replace(
    `
[type=submit] {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}`.trim(),
    `
[type=submit] {
  -webkit-appearance: button;
  background-image: none;
}
`,
  );

  fs.writeFileSync(cssPath, neo, "utf-8");
}
