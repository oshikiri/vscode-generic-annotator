const { readFileSync } = require("fs");
const { argv } = require("process");

const DAY_OF_WEEKS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

if (argv.length != 3) return;
const path = argv[2];

const content = readFileSync(path, "utf-8").split("\n");
for (let i = 0; i < content.length; i++) {
  const ci = content[i];
  const re = /\d{4}-\d{2}-\d{2}/gim;
  const matched = re.exec(ci);
  if (!matched) {
    continue;
  }
  const [year, month, day] = matched[0].split("-");
  const date = new Date(year, parseInt(month) - 1, day);
  const dayIndex = date.getDay();
  const decodation = {
    type: "decoration",
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
    renderOptions: {
      after: {
        contentText: DAY_OF_WEEKS[dayIndex],
        color: "grey",
        margin: "5px",
      },
    },
  };
  console.log(JSON.stringify(decodation));
}
