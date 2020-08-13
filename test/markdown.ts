import * as assert from 'assert'
import * as O from 'fp-ts/lib/Option'

import { printExamples, printClass } from '../src/markdown'
import { makeClass, makeDocumentable, makeProperty } from '../src/domain'

describe('makdown', () => {
  describe('printExamples', () => {
    it('should handle multiple examples', () => {
      assert.strictEqual(printExamples([]), '')
      assert.strictEqual(printExamples(['example1']), '\n\n**Example**\n\n```ts\nexample1\n```')
      assert.strictEqual(
        printExamples(['example1', 'example2']),
        '\n\n**Example**\n\n```ts\nexample1\n```\n\n**Example**\n\n```ts\nexample2\n```'
      )
    })
  })

  it('printClass', () => {
    assert.deepStrictEqual(
      printClass(
        makeClass(
          makeDocumentable('A', O.none, O.some('1.0.0'), false, [], O.none),
          'declare class A { constructor() }',
          [],
          [],
          [makeProperty(makeDocumentable('read', O.none, O.some('1.0.0'), false, [], O.none), 'readonly read: IO<A>')]
        )
      ),
      `## A (class)

**Signature**

\`\`\`ts
declare class A { constructor() }
\`\`\`

Added in v1.0.0

### read (property)

**Signature**

\`\`\`ts
readonly read: IO<A>
\`\`\`

Added in v1.0.0



`
    )
  })
})
