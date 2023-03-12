import {transform} from '../../services/transform.js'
import Command from '../../utilities/app-command.js'
import {Flags} from '@oclif/core'
import {globalFlags} from '@shopify/cli-kit/node/cli'

export default class Transform extends Command {
  static description = 'Code transformations for updating Polaris apps.'
  static flags = {
    ...globalFlags,
    include: Flags.string({
      hidden: false,
      description: 'Include files that match a provided glob expression',
      env: 'SHOPIFY_FLAG_INCLUDE',
      required: true,
    }),
    package: Flags.string({
      hidden: false,
      description: 'The package which the transform is related',
      env: 'SHOPIFY_FLAG_PACKAGE',
    }),
    transform: Flags.string({
      hidden: false,
      description: 'The name of the transform to apply.',
      env: 'SHOPIFY_FLAG_TRANSFORM',
      char: 't',
    }),
    parser: Flags.string({
      hidden: false,
      description: 'Parser to use for parsing the source files',
      env: 'SHOPIFY_FLAG_PARSER',
      options: ['babel', 'babylon', 'flow', 'ts', 'tsx'],
      default: 'tsx',
    }),
    extensions: Flags.string({
      hidden: false,
      description: 'Transform files with these file extensions (comma separated list)',
      env: 'SHOPIFY_FLAG_EXTENSIONS',
      default: 'js, jsx, ts, tsx',
      char: 'e',
    }),
    ignore: Flags.string({
      hidden: false,
      description: 'Ignore files that match a provided glob expression',
      env: 'SHOPIFY_FLAG_IGNORE',
      default: '**/node_modules/**',
    }),
    cpus: Flags.string({
      hidden: false,
      description: 'Start at most N child processes to process source files',
      env: 'SHOPIFY_FLAG_CPUS',
      char: 'c',
    }),
    runInBand: Flags.boolean({
      hidden: false,
      description: 'Run serially in the current process',
      env: 'SHOPIFY_FLAG_RUN_IN_BAND',
      default: false,
    }),
    dry: Flags.boolean({
      hidden: false,
      description: 'Do a dry-run, no code will be edited.',
      env: 'SHOPIFY_FLAG_DRY',
      default: false,
      char: 'd',
    }),
    print: Flags.boolean({
      hidden: false,
      description: 'Print the changed output for comparison.',
      env: 'SHOPIFY_FLAG_PRINT',
      default: false,
    }),
    force: Flags.boolean({
      hidden: false,
      description: 'Bypass Git safety checks and forcibly run transform.',
      env: 'SHOPIFY_FLAG_FORCE',
      default: false,
      char: 'f',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Transform)
    await transform({
      include: flags.include,
      package: flags.package,
      transform: flags.transform,
      parser: flags.parser,
      extensions: flags.extensions,
      ignore: flags.ignore,
      runInBand: flags.runInBand,
      dry: flags.dry,
      print: flags.print,
      force: flags.force,
      verbose: flags.verbose,
    })
  }
}
