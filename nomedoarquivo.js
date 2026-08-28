rm -rf node_modules package-lock.json && npm install expo@~52.0.0 --legacy-peer-deps && node -e '
const fs = require("fs");
const path = require("path");

function patch(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) patch(fp);
    else if (f === "package.json") {
      try {
        const pkg = JSON.parse(fs.readFileSync(fp, "utf8"));
        if (pkg.name && (pkg.name.startsWith("metro") || pkg.name.startsWith("@expo"))) {
          pkg.exports = Object.assign({ "./*": "./*", "./package.json": "./package.json" }, pkg.exports || {});
          fs.writeFileSync(fp, JSON.stringify(pkg, null, 2));
        }
      } catch (e) {}
    }
  }
}
patch(path.join(process.cwd(), "node_modules"));
console.log("Patch aplicado com sucesso!");
' && NODE_OPTIONS="--no-warnings" EXPO_NO_DEVTOOLS=1 npx expo start --host lan -c
