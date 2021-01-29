/**
 * @since 0.2.0
 */
import * as path from 'path'
import { spawnSync } from 'child_process'

import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import { fold } from 'fp-ts/lib/Monoid'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts/lib/Reader'
import * as O from 'fp-ts/lib/Option'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'

import { isTsx } from './utils'
import { Documentable, Module } from './domain'
import * as markdown from './markdown'
import * as P from './parser'
import * as config from './config'

/**
 * capabilities
 *
 * @since 0.2.0
 */
export interface Eff<A> extends TE.TaskEither<string, A> {}

/**
 * @since 0.2.0
 */
export interface MonadFileSystem {
  readonly getFilenames: (pattern: string) => Eff<Array<string>>
  readonly readFile: (path: string) => Eff<string>
  readonly writeFile: (path: string, content: string) => Eff<void>
  readonly existsFile: (path: string) => Eff<boolean>
  readonly clean: (pattern: string) => Eff<void>
}

/**
 * @since 0.2.0
 */
export interface MonadLog {
  readonly info: (message: string) => Eff<void>
  readonly log: (message: string) => Eff<void>
  readonly debug: (message: string) => Eff<void>
}

/**
 * @since 0.6.0
 */
export interface Env {
  readonly name: string
  readonly homepage: string
  readonly config: config.Config
}

/**
 * @since 0.2.0
 */
export interface Capabilities extends MonadFileSystem, MonadLog {}

/**
 * @since 0.6.0
 */
export interface Context {
  readonly C: Capabilities
  readonly Env: Env
}

/**
 * App effect
 *
 * @since 0.2.0
 */
export interface Effect<A> extends RTE.ReaderTaskEither<Context, string, A> {}

interface File {
  readonly path: string
  readonly content: string
  readonly overwrite: boolean
}

function file(path: string, content: string, overwrite: boolean): File {
  return {
    path,
    content,
    overwrite,
  }
}

function readFile(path: string): Effect<File> {
  return ({ C }) =>
    pipe(
      C.readFile(path),
      TE.map((content) => file(path, content, false))
    )
}

function readFiles(paths: Array<string>): Effect<Array<File>> {
  return A.array.traverse(RTE.readerTaskEither)(paths, readFile)
}

function writeFile(file: File): Effect<void> {
  return ({ C }) => {
    const overwrite = pipe(
      C.debug(`Overwriting file ${file.path}`),
      TE.chain(() => C.writeFile(file.path, file.content))
    )

    const skip = C.debug(`File ${file.path} already exists, skipping creation`)

    const write = pipe(
      C.debug('Writing file ' + file.path),
      TE.chain(() => C.writeFile(file.path, file.content))
    )

    return pipe(
      C.existsFile(file.path),
      TE.chain((exists) => (exists ? (file.overwrite ? overwrite : skip) : write))
    )
  }
}

function writeFiles(files: Array<File>): Effect<void> {
  return pipe(
    A.array.traverse(RTE.readerTaskEither)(files, writeFile),
    RTE.map(() => undefined)
  )
}

const rootPattern = (rootDir: string) => path.join(rootDir, '**', '*.+(ts|tsx)')

const getSrcPaths: Effect<Array<string>> = ({ C, Env }) =>
  pipe(
    C.getFilenames(rootPattern(Env.config.rootDir)),
    TE.map((paths) => A.array.map(paths, path.normalize)),
    TE.chainFirst((paths) => C.info(`${paths.length} modules found`))
  )

const readSources: Effect<Array<File>> = pipe(getSrcPaths, RTE.chain(readFiles))

function parseFiles(files: Array<File>): Effect<Array<Module>> {
  return ({ C, Env }) =>
    pipe(
      C.log('Parsing files...'),
      TE.chain(() => TE.fromEither(pipe(P.parseFiles(Env.config, files))))
    )
}

const foldFiles = fold(A.getMonoid<File>())

function getExampleFiles(outDir: string, modules: Array<Module>): Array<File> {
  return A.array.chain(modules, (module) => {
    const prefix = module.path.join('-')
    const extension = isTsx(prefix) ? '.tsx' : '.ts'

    function getDocumentableExamples(documentable: Documentable): Array<File> {
      return documentable.examples.map((content, i) =>
        file(
          path.join(outDir, 'examples', prefix + '-' + documentable.name + '-' + i + extension),
          content + '\n',
          true
        )
      )
    }
    const moduleExamples = pipe(
      module.documentation,
      O.fold(() => [], getDocumentableExamples)
    )
    const methods = A.array.chain(module.classes, (c) =>
      foldFiles([
        A.array.chain(c.methods, getDocumentableExamples),
        A.array.chain(c.staticMethods, getDocumentableExamples),
      ])
    )
    const interfaces = A.array.chain(module.interfaces, getDocumentableExamples)
    const typeAliases = A.array.chain(module.typeAliases, getDocumentableExamples)
    const constants = A.array.chain(module.constants, getDocumentableExamples)
    const functions = A.array.chain(module.functions, getDocumentableExamples)

    return foldFiles([moduleExamples, methods, interfaces, typeAliases, constants, functions])
  })
}

function addAssertImport(code: string): string {
  return code.indexOf('assert.') !== -1 ? `import * as assert from 'assert'\n` + code : code
}

function addReactImport(code: string): string {
  return /import\s.*React.*from.*react/.test(code) ? code : `import * as React from 'react'\n` + code
}

function handleImports(files: Array<File>, projectName: string, rootDir: string): Array<File> {
  // TODO: should this use package.json:main or tsconfig.json to figure out replace patterns ?
  // TODO: should replace patterns be configurable? Eg '{projectName}/lib' transforms to '{rootDir}/' instead of '{rootDir}/lib'
  function replaceProjectName(source: string): string {
    // Matches imports of the form:
    // import { foo } from 'projectName'
    const root = new RegExp(`from '${projectName}'`, 'g')
    // Matches imports of the form:
    // import { foo } from 'projectName/lib/...'
    const module = new RegExp(`from '${projectName}/lib/`, 'g')
    // Matches imports of the form:
    // import { foo } from 'projectName/...'
    const other = new RegExp(`from '${projectName}/`, 'g')
    return source
      .replace(root, `from '../../${rootDir}'`)
      .replace(module, `from '../../${rootDir}/`)
      .replace(other, `from '../../${rootDir}/`)
  }
  return files.map((f) => {
    const handleProjectImports = replaceProjectName(f.content)
    const handleAssert = addAssertImport(handleProjectImports)
    const content = isTsx(f.path) ? addReactImport(handleAssert) : handleAssert
    return file(f.path, content, f.overwrite)
  })
}

function getExampleIndex(outDir: string, examples: Array<File>): File {
  const content = examples.map((example) => `import './${path.basename(example.path)}'`).join('\n') + '\n'
  return file(path.join(outDir, 'examples', 'index.ts'), content, true)
}

const examplePattern = (outDir: string) => path.join(outDir, 'examples')

const cleanExamples: Effect<void> = ({ C, Env }) =>
  pipe(
    C.debug(`Clean up examples: deleting ${examplePattern(Env.config.outDir)}...`),
    TE.chain(() => C.clean(examplePattern(Env.config.outDir)))
  )

const spawnTsNode: Effect<void> = ({ C, Env }) =>
  pipe(
    C.log(`Type checking examples...`),
    TE.chain(() =>
      TE.fromIOEither(() => {
        const { status } = spawnSync('ts-node', [path.join(Env.config.outDir, 'examples', 'index.ts')], {
          stdio: 'inherit',
        })
        return status === 0 ? E.right(undefined) : E.left('Type checking error')
      })
    )
  )

function writeExamples(examples: Array<File>): Effect<void> {
  return pipe(
    RTE.ask<Context>(),
    RTE.chain(({ C, Env }) =>
      pipe(
        R.reader.of(C.log(`Writing examples...`)),
        RTE.chain(() => writeFiles([getExampleIndex(Env.config.outDir, examples), ...examples]))
      )
    )
  )
}

function typecheckExamples(modules: Array<Module>): Effect<void> {
  return pipe(
    RTE.asks(({ Env }: Context) =>
      handleImports(getExampleFiles(Env.config.outDir, modules), Env.name, Env.config.rootDir)
    ),
    RTE.chain((examples) =>
      examples.length === 0
        ? cleanExamples
        : pipe(
            writeExamples(examples),
            RTE.chain(() => spawnTsNode),
            RTE.chain(() => cleanExamples)
          )
    )
  )
}

const home = (outDir: string): File =>
  file(
    path.join(outDir, 'index.md'),
    `---
title: Home
nav_order: 1
---
`,
    false
  )

const modulesIndex = (outDir: string): File =>
  file(
    path.join(outDir, 'modules', 'index.md'),
    `---
title: Modules
has_children: true
permalink: /docs/modules
nav_order: 2
---
`,
    false
  )

const configYMLPath = (outDir: string) => path.join(outDir, '_config.yml')

function getConfigYML(env: Env): File {
  return file(
    configYMLPath(env.config.outDir),
    `remote_theme: pmarsceill/just-the-docs

# Enable or disable the site search
search_enabled: true

# Aux links for the upper right navigation
aux_links:
  '${env.name} on GitHub':
    - '${env.homepage}'
`,
    false
  )
}

let counter = 1

function getMarkdownOutpuPath(outDir: string, module: Module): string {
  return path.join(outDir, 'modules', module.path.slice(1).join(path.sep) + '.md')
}

function getModuleMarkdownFiles(outDir: string, modules: Array<Module>): Array<File> {
  return modules.map((module) =>
    file(getMarkdownOutpuPath(outDir, module), markdown.printModule(module, counter++), true)
  )
}

function getMarkdownFiles(env: Env): (modules: Array<Module>) => Array<File> {
  return (modules) => [
    home(env.config.outDir),
    modulesIndex(env.config.outDir),
    getConfigYML(env),
    ...getModuleMarkdownFiles(env.config.outDir, modules),
  ]
}

const outPattern = (outDir: string) => path.join(outDir, '**/*.{ts,tsx}.md')

function writeMarkdownFiles(files: Array<File>): Effect<void> {
  const cleanOut: Effect<void> = ({ C, Env }) =>
    pipe(
      C.log(`Writing markdown...`),
      TE.chain(() => C.debug(`Clean up docs folder: deleting ${outPattern(Env.config.outDir)}...`)),
      TE.chain(() => C.clean(outPattern(Env.config.outDir)))
    )

  return pipe(
    cleanOut,
    RTE.chain(() => writeFiles(files))
  )
}

/**
 * @since 0.2.0
 */
export const main: Effect<void> = pipe(
  RTE.ask<Context>(),
  RTE.chain((ctx) =>
    pipe(
      readSources,
      RTE.chain(parseFiles),
      RTE.chainFirst(typecheckExamples),
      RTE.map(getMarkdownFiles(ctx.Env)),
      RTE.chain(writeMarkdownFiles)
    )
  )
)
