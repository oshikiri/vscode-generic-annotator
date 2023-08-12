const { readFileSync } = require("fs");
const { argv } = require("process");

if (argv.length != 4) return;
const path = argv[2];
const regexString = argv[3];

const content = readFileSync(path, "utf-8").split("\n");
for (let i = 0; i < content.length; i++) {
  const ci = content[i];
  const re = new RegExp(regexString, "gim");
  const matched = re.exec(ci);
  if (!matched) {
    continue;
  }
  const diagnostic = {
    type: "diagnostic",
    source: "regex.js",
    severity: 1,
    message: `Matched ${regexString}`,
    range: {
      start: {
        line: i,
        character: matched.index,
      },
      end: {
        line: i,
        character: re.lastIndex,
      },
    },
  };
  console.log(JSON.stringify(diagnostic));
}
