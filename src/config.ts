/**
 * @since 0.6.0
 */
import * as t from 'io-ts'
import { fromNullable } from 'io-ts-types/lib/fromNullable'

/**
 * @since 0.6.0
 */
export const Config = fromNullable(
  t.interface({
    template: fromNullable(t.keyof({ default: null, docusaurus: null }), 'default'),
    strict: fromNullable(t.boolean, false),
    outDir: fromNullable(t.string, 'docs'),
    rootDir: fromNullable(t.string, 'src')
  }),
  {
    template: 'default',
    strict: true,
    outDir: 'docs',
    rootDir: 'src'
  }
)

/**
 * @since 0.6.0
 */
export interface Config extends t.TypeOf<typeof Config> {}
