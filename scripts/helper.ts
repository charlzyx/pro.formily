import fs from "fs";
import path from "path";

export const rewite = (filePath: string, writer: (old: string) => string) => {
  const old = fs.readFileSync(filePath).toString();
  const neo = writer(old);
  if (neo === old) return;
  fs.writeFileSync(filePath, neo);
};

export const loop = (filepath: string, it: (filepath: string) => void) => {
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
