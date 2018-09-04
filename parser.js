import './assets/toml.js'

export function read(text, position) {
    const mappings = {
      '_': '|',
      '^': '|L10|R',
      '$': '|M10|S',
      'e': '|E6 ',
      'B': '|B5 ',
      'G': '|G5 ',
      'D': '|D5 ',
      'A': '|A4 ',
      'E': '|E4 ',
      'F': '|F5 ',
    }
  text = text.slice(0, position);
  let note = parseInt(text.slice(-1), 36);
  let string = getNote(mappings[text.split('|')[0]]);
  return isNaN(note) ? null : note + string - 38;
}

export function getNote(string = '') {
  var trimmed = string.trim();
  var octave = Number(trimmed.slice(-1));
  var note = trimmed.slice(1, -1);
  console.log('getNote', {
    string,
    trimmed,
    octave,
    note,
  })
  return ([
    'C', 'C#',
    'D', 'D#',
    'E',
    'F', 'F#',
    'G', 'G#',
    'A', 'A#',
    'B'
  ].indexOf(note) + 12 * octave);
}

export function getLine(value, { row }) {
  console.log('getLine', { value, row })
  return value.split('\n')[row]
}

export function getIndexes(value, position) {
  console.log('getIndexes', { value, position })
  
  // In case you are already at the end of the file
  let line = getLine(value, position)
  return line && line.split('|').map(s => s.length).join('|')
}

export function getPreviousSiblings(value, position, indexes = getIndexes(value, position)) {
  let { row, column } = position;
  row--;
  return indexes === getIndexes(value, { row, column }) ? [...getPreviousSiblings(value, { row, column }, indexes), row] : []
}

export function getNextSiblings(value, position, indexes = getIndexes(value, position)) {
  let { row, column } = position;
  row++;
  return indexes === getIndexes(value, { row, column }) ? [row, ...getPreviousSiblings(value, { row, column }, indexes)] : []
}

export function getFirstSibling(value, position, indexes = getIndexes(value, position)) {
  let { row, column } = position;
  return indexes === getIndexes(value, { row: row - 1, column }) ? getFirstSibling(value, { row: row - 1, column }, indexes) : row
}

export function getLastSibling(value, position, indexes = getIndexes(value, position)) {
  let { row, column } = position;
  console.log('getLastSibling', {
    value, row, column, indexes
  })
  return indexes === getIndexes(value, { row: row + 1, column }) ? getLastSibling(value, { row: row + 1, column }, indexes) : row
}

export function getSiblings(value, position) {
  return value
    .split('\n')
    .map((line, row) => row)
    .slice(getFirstSibling(value, position), getLastSibling(value, position))
}

export function getPreviousRow(value, position) {
  let { row, column } = position;
  return value.split('\n')
    .slice(row)
    .map((line, row) => ({ line, row }))
    .filter(({ line }) => line.match(/^(\|?[-\w]*)(\|[-\w]*\s{0,2})\s*#?/))[getSiblings(value, position).length].row
}

export function getNextRow(value, position) {
  let { row, column } = position;
  let regex = /^(\|?[-\w]*)(\|[-\w]*\s{0,2})\s*#?/;
  console.log('getNextRow', { value, position })
  return value.split('\n')
    .slice(row)
    .map((line, row) => ({ line, row }))
    .filter(({ line }) => line.match(regex))[getSiblings(value, position).length].row + row + 1
}

export function getStartingRows(value) {
  return [0, 1, 2, 3, 4, 5]
}

export const parse = toml.parse

export default {
  parse,
  getFirstSibling,
  getIndexes,
  getLastSibling,
  getLine,
  getNextRow,
  getNextSiblings,
  getNote,
  getPreviousRow,
  getPreviousSiblings,
  getSiblings,
  read
}