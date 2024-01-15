const path = require("path");
const fs = require("fs");

const cssPath = path.resolve(
  __dirname,
  "../node_modules/@rspress/theme-default/dist/bundle.css",
);

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
