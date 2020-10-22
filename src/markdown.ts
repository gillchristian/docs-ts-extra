/**
 * markdown utilities
 *
 * @since 0.2.0
 */

import * as prettier from 'prettier'
import * as O from 'fp-ts/lib/Option'
import { Class, Function, Interface, Method, TypeAlias, Constant, Module, Export, Property } from './domain'
import { pipe } from 'fp-ts/lib/pipeable'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as R from 'fp-ts/lib/Record'

import { isTsx } from './utils'

// HERE why require ?
const toc = require('markdown-toc')

const CRLF = '\n\n'
const h1 = (title: string) => `# ${title}`
const h2 = (title: string) => `## ${title}`
const h3 = (title: string) => `### ${title}`
const makeFence = (language: string): Fence => code => '```' + language + '\n' + code + '\n' + '```'
/**
 * @since 0.6.0
 */
export const ts = makeFence('ts')
const tsx = makeFence('tsx')
const bold = (code: string) => '**' + code + '**'
const strike = (text: string) => '~~' + text + '~~'

type Fence = (code: string) => string

const prettierOptions: prettier.Options = {
  parser: 'markdown',
  semi: false,
  singleQuote: true,
  printWidth: 120
}

function handleTitle(s: string, deprecated: boolean): string {
  const title = s.trim() === 'hasOwnProperty' ? s + ' (function)' : s
  return deprecated ? strike(title) : title
}

/**
 * @since 0.5.0
 */
export function printInterface(i: Interface, fence: Fence): string {
  let s = h2(handleTitle(i.name, i.deprecated) + ' (interface)')
  s += printDescription(i.description)
  s += printSignature(i.signature)
  s += printExamples(i.examples, fence)
  s += printSince(i.since)
  s += CRLF
  return s
}

/**
 * @since 0.5.0
 */
export function printTypeAlias(ta: TypeAlias, fence: Fence): string {
  let s = h2(handleTitle(ta.name, ta.deprecated) + ' (type alias)')
  s += printDescription(ta.description)
  s += printSignature(ta.signature)
  s += printExamples(ta.examples, fence)
  s += printSince(ta.since)
  s += CRLF
  return s
}

/**
 * @since 0.5.0
 */
export function printConstant(c: Constant, fence: Fence): string {
  let s = h2(handleTitle(c.name, c.deprecated))
  s += printDescription(c.description)
  s += printSignature(c.signature)
  s += printExamples(c.examples, fence)
  s += printSince(c.since)
  s += CRLF
  return s
}

/**
 * @since 0.5.0
 */
export function printFunction(f: Function, fence: Fence): string {
  let s = h2(handleTitle(f.name, f.deprecated))
  s += printDescription(f.description)
  s += printSignatures(f.signatures)
  s += printExamples(f.examples, fence)
  s += printSince(f.since)
  s += CRLF
  return s
}

function printStaticMethod(f: Method, fence: Fence): string {
  let s = h3(handleTitle(f.name, f.deprecated) + ' (static method)')
  s += printDescription(f.description)
  s += printSignatures(f.signatures)
  s += printExamples(f.examples, fence)
  s += printSince(f.since)
  s += CRLF
  return s
}

/**
 * @since 0.5.0
 */
export function printExport(e: Export, fence: Fence): string {
  let s = h2(handleTitle(e.name, e.deprecated))
  s += printDescription(e.description)
  s += printSignature(e.signature)
  s += printExamples(e.examples, fence)
  s += printSince(e.since)
  s += CRLF
  return s
}

function printMethod(m: Method, fence: Fence): string {
  let s = h3(handleTitle(m.name, m.deprecated) + ' (method)')
  s += printDescription(m.description)
  s += printSignatures(m.signatures)
  s += printExamples(m.examples, fence)
  s += printSince(m.since)
  s += CRLF
  return s
}

function printProperty(p: Property, fence: Fence): string {
  let s = h3(handleTitle(p.name, p.deprecated) + ' (property)')
  s += printDescription(p.description)
  s += printSignature(p.signature)
  s += printExamples(p.examples, fence)
  s += printSince(p.since)
  s += CRLF
  return s
}

/**
 * @since 0.4.0
 */
export function printClass(c: Class, fence: Fence): string {
  let s = h2(handleTitle(c.name, c.deprecated) + ' (class)')
  s += printDescription(c.description)
  s += printSignature(c.signature)
  s += printExamples(c.examples, fence)
  s += printSince(c.since)
  s += CRLF
  s += c.staticMethods.map(m => printStaticMethod(m, fence)).join(CRLF)
  s += c.methods.map(m => printMethod(m, fence)).join(CRLF)
  s += c.properties.map(p => printProperty(p, fence)).join(CRLF)
  s += CRLF
  return s
}

function printSignature(signature: string): string {
  return CRLF + bold('Signature') + CRLF + ts(signature)
}

function printSignatures(signature: Array<string>): string {
  return CRLF + bold('Signature') + CRLF + ts(signature.join('\n'))
}

function printDescription(description: O.Option<string>): string {
  return pipe(
    description,
    O.fold(
      () => '',
      s => CRLF + s
    )
  )
}

function printModuleDescription(m: Module, fence: Fence): string {
  return pipe(
    m.documentation,
    O.fold(
      () => h2(handleTitle(m.name, false) + ' overview') + CRLF,
      doc => {
        let s = h2(handleTitle(m.name, doc.deprecated) + ' overview')
        s += CRLF
        s += printDescription(doc.description)
        s += printExamples(doc.examples, fence)
        s += printSince(doc.since)
        s += CRLF
        return s
      }
    )
  )
}

/**
 * @since 0.2.0
 */
export function printExamples(examples: Array<string>, fence: Fence): string {
  // HERE use tsx or ts fence
  if (examples.length === 0) {
    return ''
  }
  return (
    CRLF +
    examples
      .map(code => {
        return bold('Example') + CRLF + fence(code)
      })
      .join(CRLF)
  )
}

function printSince(since: O.Option<string>): string {
  return pipe(
    since,
    O.fold(
      () => '',
      since => CRLF + `Added in v${since}`
    )
  )
}

function printHeader(title: string, order: number): string {
  let s = '---\n'
  s += `title: ${title}\n`
  s += `nav_order: ${order}\n`
  s += `parent: Modules\n`
  s += '---\n\n'
  return s
}

type Item = Interface | TypeAlias | Function | Class | Constant | Export

function printItem(item: Item, fence: Fence): string {
  switch (item._tag) {
    case 'Class':
      return printClass(item, fence)
    case 'Constant':
      return printConstant(item, fence)
    case 'Export':
      return printExport(item, fence)
    case 'Function':
      return printFunction(item, fence)
    case 'Interface':
      return printInterface(item, fence)
    case 'TypeAlias':
      return printTypeAlias(item, fence)
  }
}

/**
 * @since 0.2.0
 */
export function printModule(module: Module, order: number): string {
  const header = printHeader(module.path.slice(1).join('/'), order)
  const fence = isTsx(module.path.join('/')) ? tsx : ts
  const items = [
    ...module.interfaces,
    ...module.typeAliases,
    ...module.classes,
    ...module.constants,
    ...module.functions,
    ...module.exports
  ]
  const DEFAULT_CATEGORY = 'utils'
  const groups = pipe(
    items,
    NEA.groupBy(item =>
      pipe(
        item.category,
        O.getOrElse(() => DEFAULT_CATEGORY)
      )
    )
  )
  const md = pipe(
    groups,
    R.collect(
      (category, items) =>
        h1(category) +
        CRLF +
        items
          .map(i => printItem(i, fence))
          .sort()
          .join('')
    )
  )
    .sort()
    .join('')

  const result =
    header +
    printModuleDescription(module, fence) +
    CRLF +
    '---' +
    CRLF +
    '<h2 class="text-delta">Table of contents</h2>' +
    CRLF +
    toc(md).content +
    CRLF +
    '---' +
    CRLF +
    md
  return prettier.format(result, prettierOptions)
}
