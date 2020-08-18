/**
 * CLI
 *
 * @since 0.2.0
 */
import { main } from './index'
import chalk from 'chalk'

// tslint:disable-next-line: no-console
main().catch(e => console.log(chalk.bold.red(`Unexpected error: ${e}`)))
