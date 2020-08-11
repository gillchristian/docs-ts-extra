/**
 * @since 0.2.0
 */
import * as path from 'path'
import * as fs from 'fs-extra'
import chalk from 'chalk'
import * as glob from 'glob'
import * as rimraf from 'rimraf'
import { log } from 'fp-ts/lib/Console'
import * as IO from 'fp-ts/lib/IO'
import { pipe } from 'fp-ts/lib/pipeable'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import { sequenceS } from 'fp-ts/lib/Apply'
import { formatValidationErrors } from 'io-ts-reporters'
import * as core from './core'
import * as config from './config'

interface Effect<A> extends RTE.ReaderTaskEither<core.Capabilities, string, A> {}

interface PackageJSON {
  readonly name: string
  readonly homepage?: string
  readonly docsts: unknown
}

const getPackageJSON: Effect<PackageJSON> = C =>
  pipe(
    C.readFile(path.join(process.cwd(), 'package.json')),
    TE.chain(s => {
      const json = JSON.parse(s)
      const name = json.name

      return pipe(
        C.debug(`Project name detected: ${name}`),
        TE.map(() => ({
          name,
          homepage: json.homepage,
          docsts: json.docsts
        }))
      )
    })
  )

function validateConfig(pkg: PackageJSON, defaultConfig: config.Config): E.Either<string, config.Config> {
  return pipe(
    pkg.docsts || {},
    config.PartialConfig.decode,
    E.mapLeft(formatValidationErrors),
    E.mapLeft(errors => 'Failed to decode "docsts" config:\n' + errors.join('\n')),
    E.map(validConfig => config.merge(validConfig, defaultConfig))
  )
}

function checkHomepage(pkg: PackageJSON): E.Either<string, string> {
  return pkg.homepage === undefined ? E.left('Missing homepage in package.json') : E.right(pkg.homepage)
}

const getContext: Effect<core.Env> = pipe(
  getPackageJSON,
  RTE.chainEitherK(pkg =>
    sequenceS(E.either)({
      config: validateConfig(pkg, config.defaultConfig),
      name: E.right(pkg.name),
      homepage: checkHomepage(pkg)
    })
  )
)

const capabilities: core.Capabilities = {
  getFilenames: (pattern: string) => TE.rightIO(() => glob.sync(pattern)),
  readFile: (path: string) => TE.rightIO(() => fs.readFileSync(path, { encoding: 'utf8' })),
  writeFile: (path: string, content: string) => TE.rightIO(() => fs.outputFileSync(path, content)),
  existsFile: (path: string) => TE.rightIO(() => fs.existsSync(path)),
  clean: (pattern: string) => TE.rightIO(() => rimraf.sync(pattern)),
  info: (message: string) => TE.rightIO(log(chalk.bold.magenta(message))),
  log: (message: string) => TE.rightIO(log(chalk.cyan(message))),
  debug: (message: string) => TE.rightIO(log(chalk.gray(message)))
}

const exit = (code: 0 | 1): IO.IO<void> => () => process.exit(code)

const onLeft = (e: string): T.Task<void> =>
  T.fromIO(
    pipe(
      log(e),
      IO.chain(() => exit(1))
    )
  )

const onRight: T.Task<void> = T.fromIO(log(chalk.bold.green('Docs generation succeeded!')))

/**
 * @since 0.2.0
 */
export const main: T.Task<void> = pipe(
  getContext,
  RTE.chain(env =>
    pipe(
      core.main,
      RTE.local(C => ({ Env: env, C }))
    )
  ),
  rte => rte(capabilities),
  TE.fold(onLeft, () => onRight)
)
