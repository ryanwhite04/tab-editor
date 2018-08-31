export default [{
  file: '1',
  tests: [
    {
      // ignore: true,
      position: { row: 12, column: 0 },
      getFirstSibling: 10,
      getLastSibling: 15,
      getPreviousSiblings: [10, 11],
      getLine: 'G||--------0---------|--------0---------|'
    },
    {
      position: { row: 24, column: 0 },
      getLine: undefined,
    },
    {
      // ignore: true,
      position: { row: 20, column: 0 },
      getFirstSibling: 18,
      getLastSibling: 23,
    },
  ]
}, {
  ignore: true,
  file: 'Guitar Pro/All of them Witches',
  tests: [
    {
      position: { row: 34, column: 0 },
      getFirstSibling: 34,
      getStartingRows: [0, 1, 2, 3, 4, 5],
    }
  ]
}]