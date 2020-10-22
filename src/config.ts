/**
 * @since 0.6.0
 */
import * as t from 'io-ts'
import { fromNullable } from 'io-ts-types/lib/fromNullable'
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString'

const TemplateType = t.keyof({ default: null, docusaurus: null })

/**
 * @since 0.6.0
 */
export const Config = fromNullable(
  t.interface({
    template: fromNullable(TemplateType, 'default'),
    strict: fromNullable(t.boolean, false),
    outDir: fromNullable(NonEmptyString, 'docs' as NonEmptyString),
    rootDir: fromNullable(NonEmptyString, 'src' as NonEmptyString)
  }),
  {
    template: 'default',
    strict: true,
    outDir: 'docs' as NonEmptyString,
    rootDir: 'src' as NonEmptyString
  }
)

/**
 * @since 0.6.0
 */
export interface Config extends t.TypeOf<typeof Config> {}
