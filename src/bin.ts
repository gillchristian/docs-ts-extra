/**
 * CLI
 *
 * @since 0.2.0
 */
import chalk from 'chalk'

import { main } from './index'

// tslint:disable-next-line: no-console
main().catch((e) => console.log(chalk.bold.red(`Unexpected error: ${e}`)))
