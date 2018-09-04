export default [{
  file: 'Tabscii/1',
  tests: [
    {
      position: { row: 12, column: 0 },
      getFirstSibling: 10,
      getLastSibling: 15,
      getPreviousSiblings: [10, 11],
      getLine: 'G4 |-------0-------|-------0-------|'
    },
    {
      position: { row: 24, column: 0 },
      getLine: undefined,
    },
    {
      position: { row: 20, column: 0 },
      getFirstSibling: 18,
      getLastSibling: 23,
    },
  ]
}, {
  file: 'Guitar Pro/All of them Witches',
  tests: [
    {
      position: { row: 34, column: 0 },
      getFirstSibling: 34,
      getStartingRows: [0, 1, 2, 3, 4, 5],
    }
  ]
}, {
  file: 'Guitar Pro/Anatole',
  tests: [ {
    position: { row: 10, column: 10 },
    getFirstSibling: 10,
  }, {
    position: { row: 20, column: 10 },
    getFirstSibling: 20,
  }]
}]