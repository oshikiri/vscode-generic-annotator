const { readFileSync } = require("fs");
const { argv } = require("process");

const path = argv[2];
const content = readFileSync(path, "utf-8").split("\n");
const diagnostics = [];
const regexString = '\\d{4}-\\d{2}-\\d{2}';

for (let i = 0; i < content.length; i++) {
  const ci = content[i];
  const re = new RegExp(regexString, "gim");
  const matched = re.exec(ci);
  if (!matched) {
    continue;
  }
  diagnostics.push({
    source: "Regex",
    severity: 1,
    message: `Matched ${regexString}`,
    range: {
      startLine: i,
      endLine: i,
      startCharacter: matched.index,
      endCharacter: re.lastIndex,
    },
  });
}

for (const d of diagnostics) {
  console.log(JSON.stringify(d));
}
