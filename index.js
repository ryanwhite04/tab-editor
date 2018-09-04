import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module'
import AceEditor from './node_modules/ace-editor/index.js'
import Tone from './assets/tone.js'
import 'https://unpkg.com/@material/mwc-fab@0.1.2/mwc-fab.js?module'
import {
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
} from './parser.js'
import {
  names,
  families,
  notes,
  formats,
} from 'https://ryanwhite04.com/soundfonts/index.js'

const { Players } = Tone;

async function loadInstrument(id = 24, ext = 'mp3') {

  function buffer(ogg) {
    return new Promise((resolve, reject) => new Players(ogg, resolve))
  }
  
  const player = (await fetch(`https://ryanwhite04.com/soundfonts/${names[id]}.json`)
    .then(response => response.json())
    .then(buffer)
    .catch(console.error)).toMaster()

  return {
    name: names[id],
    notes: { first: 21, last: 109 },
    family: families[~~(id / 16)],
    play: note => {
      player.has(note) && player.get(note).start()
    },
  }
}

function prev(instruments) {
  return function (editor, { count, ...args }) {
    const position = editor.getCursorPosition();
    const { row, column } = position;
    const value = editor.getValue();
    const lines = value.split('\n')
    const line = lines[row]
    const note = read(line.slice(0, column))
    const next = line.slice(column - 4, column )
    const it = line.split('|')
      .filter(string => /I[\dA-F]\d/.test(string))
      .reverse()[0]
      
    let instrument = it ? (8*it[1]+ +it[2]) : 24
    
    // .split('').reverse().join('')
    if (/\|---/.test(next)) {
      editor.navigateLeft(4);
      this.exec(editor, { ...args, count: ++count });
    } else if (!column) {
      editor.navigateUp(10)
      editor.navigateLineEnd()
      
      this.exec(editor, { ...args, count: ++count });
    } else {
      instruments.play(note, instrument)
      editor.navigateLeft(args.times)
    }
  }
}

function next(instruments, format = 'pro') {
  
  function standardNext(editor, { count, ...args }) {
    const position = editor.getCursorPosition();
    const { row, column } = position;
    const value = editor.getValue();
    const lines = value.split('\n')
    const line = lines[row]
    const next = line.slice(column, column + 4)
    
    const it = line.split('|')
      .filter(string => /I[\dA-F]\d/.test(string))
      .reverse()[0]
      
    let instrument = it ? (8*it[1]+ +it[2]) : 24
    
    if (/\|---/.test(next)) {
      editor.navigateRight(4);
      this.exec(editor, { ...args, count: ++count });
    } else if (/\|L\d\d/.test(next)) {
      editor.navigateTo(parseInt(next.slice(2)), 0)
      this.exec(editor, { ...args, count: ++count });
    } else if (/^\|\s*$/.test(next)) {
      editor.navigateDown(10)
      editor.navigateLineStart()
      this.exec(editor, { ...args, count: ++count });
    } else if (/^\|\|\s*$/.test(next)) {
      // editor.navigateDown(10)
      editor.navigateLineStart()
      this.exec(editor, { ...args, count: ++count });
    } else if (/^\*\|\s*$/.test(next)) {
      // editor.navigateDown(10)
      editor.navigateLineStart()
      this.exec(editor, { ...args, count: ++count });
    } else if (!column && /\|?[A-Ga-g]?#?\d?\|/.test(next)) {
      editor.navigateRight(next.split('|')[0].length)
      this.exec(editor, { ...args, count: ++count });
    } else {
      instruments.play(read(line.slice(0, 1+column)), instrument)
      editor.navigateRight(args.times)
    }
  }
  
  function proNext(editor, { count, ...args }) {
    const position = editor.getCursorPosition();
    const { row, column } = position;
    const value = editor.getValue();
    const lines = value.split('\n');
    const line = lines[position.row];
    const next = line.slice(column, column + 4)
    
    const it = line.split('|')
      .filter(string => /I[\dA-F]\d/.test(string))
      .reverse()[0]
      
    let instrument = it ? (8*it[1]+ +it[2]) : 24
    
    if (/^\|-{1,3}/.test(next)) {
      editor.navigateRight(Math.min(...getSiblings(value, position)
        .map(row => getLine(value, { row }))
        .map(sibling => sibling.slice(column).match(/\|(-*)/)[0].length)));
      this.exec(editor, { ...args, count: ++count });
    } else if (/\|L\d\d/.test(next)) {
      editor.navigateTo(parseInt(next.slice(2)), 0)
      this.exec(editor, { ...args, count: ++count });
    } else if (/^\|\s*$/.test(next)) {
      editor.navigateDown(lines
        .slice(row)
        .map((line, row) => ({ line, row }))
        .filter(({ line }) => line.match(/^(\|?[-\w]*)(\|[-\w]*\s{0,2})\s*#?/))[getSiblings(value, position).length].row)
      editor.navigateLineStart()
      this.exec(editor, { ...args, count: ++count });
    } else if (/^\|\|\s*$/.test(next)) {
      editor.navigateLineStart()
      this.exec(editor, { ...args, count: ++count });
    } else if (/^\*\|\s*$/.test(next)) {
      editor.navigateLineStart()
      this.exec(editor, { ...args, count: ++count });
    } else if (!column && /\|?[A-Ga-g]?#?\d?\|/.test(next)) {
      editor.navigateRight(next.split('|')[0].length)
      this.exec(editor, { ...args, count: ++count });
    } else {
      const note = read(line.slice(0, 1+column))
      const jump = Math.max(...getSiblings(value, position)
        .map(row => {
          console.log({ getLine, value, row })
          return getLine(value, { row })
        })
        .map(sibling => sibling.slice(column).split('-')[0].length))
      jump && editor.navigateRight(jump)
      instruments.play(note, instrument)
      editor.navigateRight(args.times)
    }
  }

  return format === 'pro' ? proNext : standardNext
}

function toggle() {
  this.paused ?
    this.timer = setInterval(() => this.editor.execCommand('gotolineend'), 15000 / this.tempo) :
    clearInterval(this.timer);
  this.paused = !this.paused;
}

function download(app) {
  return function(editor, args) {
    console.log('download', { app, editor, args })
  }
}

function upload(app) {
  return function(editor, args) {
    console.log('upload', { app, editor, args })
  }
}
  
class TabEditor extends AceEditor {
  
  static get properties() {
    return {
      paused: Boolean, // readOnly, returns a booolean indicating whether the element is paused
      tempo: Number,
      instruments: Array,
      meta: Object,
      controls: Boolean,
      src: String, // Not implemented yet, alternative source for value, overrides textContent once loaded
      playbackRate: Number, // Not Implemented yet, alternative to tempo from media element
      volume: Number, // Is a double indicating the audio volume, from 0.0 (silent) to 1.0 (loudest)
      convert: Boolean, // Wether or not to parse the textContent and try to convert it to a stricter format
    }
  }
  
  set src(src) {
    this.editor && this.load(src)
  }
  
  constructor() {
    super();
    this.convert = false;
    this.controls = false;
    this.alt = true;
    this.instruments = new Array(128).fill(false);
    this.instruments.load = async (id) => {
      this.message(`Loading ${names[id]}`);
      let instrument = loadInstrument(id);
      this.instruments[id] = 'loading';
      this.instruments[id] = await instrument;
      this.message(`Finished Loading ${names[id]}`)
    }
    this.instruments.play = function(note, id = 24) {
      if (this[id]) {
        this[id] === 'loading' || this[id].play(note)
      } else {
        this.load(id)
      }
    }
    this.tempo = 240;
    this.paused = true;
    this.meta = {};
    this.instruments.load(24)
  }

  async _firstRendered() {

    await super._firstRendered();
    
    const { instruments, editor } = this;
    
    let commands = [
      {
        name: 'toggle',
        exec: toggle,
        bindKey: { win: 'Alt-Space', mac: 'Alt-Space' },
      },
      {
        name: 'download',
        exec: download(this),
        bindKey: { win: 'Ctrl-S', mac: 'Ctrl-S' },
      },
      {
        name: 'upload',
        exec: upload(this),
        bindKey: { win: 'Ctrl-O', mac: 'Ctrl-O' },
      },
      {
        name: 'gotolinestart',
        exec: prev(instruments),
        multiSelectAction: "forEach",
        scrollIntoView: "cursor",
        readOnly: true
      },
      {
        name: 'gotolineend',
        exec: next(instruments),
        multiSelectAction: "forEach",
        scrollIntoView: "cursor",
        readOnly: true
      }
    ]
    
    
    commands.map(({ name, ...command }) => {
      editor.commands.addCommand({
        ...(editor.commands.commands[name] || { name }),
        ...command,
      })
    })
    
    editor.setOptions({
      lineNumbers: true,
      viewportMargin: Infinity,
      firstLineNumber: 0,
      fixedGutter: false,
      selectionStyle: 'line',
      enableSnippets: true,
    })
    
    // snippets
    this.registerSnippets(`snippet e
	|E5 |I30|---
	|B4 |I30|---
	|G4 |I30|---
	|D4 |I30|---
	|A3 |I30|---
	|E3 |I30|---`, 'text');
    
    // autocomplete
    ace.require('ace/ext/language_tools').addCompleter({
      getCompletions: (editor, session, pos, prefix, callback) =>
        callback(null, (prefix.length === 0) ? [] : (autocomplete || [])),
    });
    
    editor.on('change', (event, editor) => {
      try {
        this.meta = parse(editor.getValue()
          .split('+++')
          .filter((match, i) => i%2 && match)
          .join('\n'))
      } catch(err) { this.message(err) }
    })
    
    this.left = () => this.editor.execCommand('gotolinestart')
    this.right = () => this.editor.execCommand('gotolineend')
    
    this.src && this.load(this.src)
  }
  
  _render({ controls, paused, instruments }) {
    return html`
      <style>
        #controls {
          display: flex;
          justify-content: center;
          margin: 1em
        }
        mwc-fab {
          margin: 0 1em;
          align-self: center;
        }
      </style>
      ${super._render()}
      ${controls && html`<div id="controls">
        <mwc-fab on-click="${this.left}" icon="arrow_left" mini></mwc-fab>
        <mwc-fab on-click="${this.toggle}" icon="${paused ? 'play_arrow' : 'pause'}"></mwc-fab>
        <mwc-fab on-click="${this.right}" icon="arrow_right" mini></mwc-fab>
      </div>`}
    `
  }
  
  message(message) {
    this.dispatchEvent(new CustomEvent('message', { detail: { message }}));
  }
  
  async load(src) {
    let text = await fetch(src).then(response => response.text()).catch(console.error)
    text && this.editor.setValue(text)
  }
  
}

customElements.define('tab-editor', TabEditor);