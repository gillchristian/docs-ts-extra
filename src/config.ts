/**
 * @since 0.6.0
 */
import * as t from 'io-ts'

/**
 * @since 0.6.0
 */
export const PartialConfig = t.partial({
  strict: t.boolean,
  outDir: t.string,
  rootDir: t.string
})

/**
 * @since 0.6.0
 */
export interface PartialConfig extends t.TypeOf<typeof PartialConfig> {}

/**
 * @since 0.6.0
 */
export interface Config {
  strict: boolean
  outDir: string
  rootDir: string
}

/**
 * @since 0.6.0
 */
export const mergeConfig = (partial: PartialConfig, config: Config): Config => ({
  strict: partial.strict === undefined ? config.strict : partial.strict,
  outDir: partial.outDir === undefined ? config.outDir : partial.outDir,
  rootDir: partial.rootDir === undefined ? config.rootDir : partial.rootDir
})

/**
 * @since 0.6.0
 */
export const defaultConfig: Config = { strict: false, outDir: 'docs', rootDir: 'src' }
