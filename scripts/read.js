const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const adaptor = argv[0];
const mode = argv[1];
const rmrf = require("rimraf");

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
  loop(path.join(__dirname, "../docs"), (item) => {
    console.log(item);
  });
};

docs();
