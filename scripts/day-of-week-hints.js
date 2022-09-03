const decodations = [
  {
    range: {
      start: {
        line: 0,
        character: 0,
      },
      end: {
        line: 0,
        character: 10,
      },
    },
    renderOptions: {
      after: {
        contentText: "Thu",
        color: "grey",
        margin: "5px",
      },
    },
  },
];
for (const d of decodations) {
  console.log(JSON.stringify(d));
}
