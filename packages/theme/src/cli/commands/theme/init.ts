import {themeFlags} from '../../flags.js'
import {Flags} from '@oclif/core'
import {cli, path, ui} from '@shopify/cli-kit'
import Command from '@shopify/cli-kit/node/base-command'
import {rawClone, latestClone} from '../../services/init.js'

export default class Init extends Command {
  static description = 'Clones a Git repository to use as a starting point for building a new theme.'

  static args = [
    {
      name: 'name',
      description: 'Name of the new theme',
      required: false,
    },
  ]

  static flags = {
    ...cli.globalFlags,
    ...themeFlags,
    'clone-url': Flags.string({
      char: 'u',
      description:
        "The Git URL to clone from. Defaults to Shopify's example theme, Dawn: https://github.com/Shopify/dawn.git",
      env: 'SHOPIFY_FLAG_CLONE_URL',
    }),
    latest: Flags.boolean({
      char: 'l',
      description: "Downloads the latest release of the \`clone-url\`",
      env: 'SHOPIFY_FLAG_LATEST',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Init)
    const directory = args.name || 'dawn'
    const destination = path.resolve(flags.path, directory)
    const repoUrl = 'https://github.com/Shopify/dawn.git'
    const name = args.name || (await this.promptName())

    // eslint-disable-next-line no-console
    console.log(args, flags, destination)
    // console.log(destination)

    // await this.themeInit(destination)
    if (flags.latest) {
      latestClone({ repoUrl, destination })
    } else {
      rawClone({ repoUrl, destination })
    }
  }

  async promptName() {
    const question: ui.Question = {type: 'input', name: 'name', message: 'Name of the new theme'}
    const {name} = await ui.prompt([question])
    return name
  }
}
