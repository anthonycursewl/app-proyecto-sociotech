const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = "D:\\Users\\58426\\projects\\app-proyecto-sociotech";
const IMPORT = `import { Text } from "@/components/common/SText"`;

const files = execSync(`dir /s /b *.tsx`, { cwd: ROOT, encoding: "utf8" })
  .split("\r\n")
  .filter(Boolean)
  .filter(
    (f) =>
      !f.includes("node_modules") &&
      !f.includes("dist") &&
      !f.includes("app-example") &&
      !f.includes("SText")
  );

let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Match one-line import of Text from react-native
  const importRegex =
    /import\s*\{\s*([^}]*\bText\b[^}]*)\}\s*from\s+["']react-native["']\s*;?/m;
  const match = importRegex.exec(content);
  if (!match) continue;

  const allImports = match[1].split(",").map((s) => s.trim()).filter(Boolean);
  const otherImports = allImports.filter((s) => s !== "Text");

  const matchedStr = match[0];

  let replacement;
  if (otherImports.length > 0) {
    replacement = `import { ${otherImports.join(", ")} } from "react-native";\n${IMPORT}`;
  } else {
    replacement = IMPORT;
  }

  content = content.replace(matchedStr, replacement);

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    changed++;
    console.log(`✓ ${path.relative(ROOT, file)}`);
  }
}

console.log(`\nDone. ${changed} files updated.`);
