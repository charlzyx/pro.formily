const fs = require("fs");
const path = require("path");

const target = path.join(
	__dirname,
	"./node_modules/@rspress/theme-default/dist/bundle.css",
);
const patch = path.join(__dirname, "./patch.css");

fs.writeFileSync(target, fs.readFileSync(patch, "utf-8"), "utf-8");
