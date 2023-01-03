const { argv } = require("process");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

main();

async function main() {
  if (argv.length != 3) return;
  const path = argv[2];

  const stderr = await execAndGetStderr(
    `hledger check balancednoautoconversion -f ${path}`
  );

  const diagnostics = parseDiagnostics(stderr);
  for (const d of diagnostics) {
    console.log(JSON.stringify(d));
  }
}

async function execAndGetStderr(command) {
  try {
    const { stderr } = await execPromise(command);
    return stderr;
  } catch (err) {
    return err.stderr;
  }
}

function parseDiagnostics(stderr) {
  let diagnostics = [];
  let currentDiagnostic = {};
  for (const line of stderr.split("\n")) {
    const isHeader = line.startsWith("hledger: ");
    if (isHeader) {
      if (currentDiagnostic.source) {
        diagnostics.push(currentDiagnostic);
      }
      currentDiagnostic = parseHeader(line);
    } else {
      if (line != "") {
        currentDiagnostic.message += "\n" + line;
      }
    }
  }
  diagnostics.push(currentDiagnostic);

  return diagnostics;
}

function parseHeader(line) {
  const m = line.match(/lines (\d+)-(\d+)/);
  return {
    type: "diagnostic",
    source: "hledger-check",
    severity: 1,
    message: line,
    range: {
      start: {
        line: Number(m[1]) - 1,
        character: 0,
      },
      end: {
        line: Number(m[2]) - 1,
        character: 80,
      },
    },
  };
}
