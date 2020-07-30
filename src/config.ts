/**
 * @since 0.3.0
 */
import * as t from 'io-ts'

/**
 * @since 0.3.0
 */
export const PartialConfig = t.partial({
  strict: t.boolean
})

/**
 * @since 0.3.0
 */
export interface PartialConfig extends t.TypeOf<typeof PartialConfig> {}

/**
 * @since 0.3.0
 */
export interface Config {
  strict: boolean
}

/**
 * @since 0.3.0
 */
export const merge = (partial: PartialConfig, config: Config): Config => ({
  strict: partial.strict === undefined ? config.strict : partial.strict
})

/**
 * @since 0.3.0
 */
export const defaultConfig: Config = { strict: false }
