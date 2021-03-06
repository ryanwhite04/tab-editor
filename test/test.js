import * as parser from '../parser.js'

import tests from './tests.js'

describe('Parser', () => {
  tests
    .filter(({ ignore }) => !ignore)
    .map(({ file, tests }) => {
      context(file, function() {
        
        // Just make sure the text file is ready
        let value;
        before(async () => {
          value = await fetch(`../files/${this.title}.txt`)
            .then(file => file.text())
            .catch(console.error)
        })
        
        // Run a test for each condition on each position specified in tests.js
        tests
          .filter(({ ignore }) => !ignore)
          .map(({ position, ...conditions }) => {
            describe(`Row: ${position.row}, Column: ${position.column}`, () => {
              Object.entries(conditions).map(([func, expectation]) => {
                it(func, () => {
                  chai.expect(parser[func](value, position)).to.eql(expectation)
                })
              })
            })
          })
      })
    })
})