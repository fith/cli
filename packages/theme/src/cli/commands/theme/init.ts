import {themeFlags} from '../../flags.js'
import {Flags} from '@oclif/core'
import {cli, path, git, ui} from '@shopify/cli-kit'
import Command from '@shopify/cli-kit/node/base-command'

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
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Init)
    const root = flags.path ? path.resolve(flags.path) : process.cwd()
    const directory = args.name || 'dawn'
    const destination = `${root}/${directory}`

    // eslint-disable-next-line no-console
    console.log(args, flags, root)

    await this.themeInit(destination)

    // const name = args.name || (await this.promptName())
    // const command = ['theme', 'init', name]
    // await execCLI2(command, {
    //   directory,
    // })
  }

  async promptName() {
    const question: ui.Question = {type: 'input', name: 'name', message: 'Name of the new theme'}
    const {name} = await ui.prompt([question])
    return name
  }

  async themeInit(destination: string) {
    const url = 'https://github.com/Shopify/dawn.git'

    await ui
      .newListr([
        {
          title: `!!! title !!!`,
          task: async () => {
            await git.downloadRepository({
              repoUrl: url,
              destination,
              shallow: false,
            })
            // const origin = path.join(templateDownloadDir, functionTemplatePath(options))
            // await template.recursiveDirectoryCopy(origin, options.extensionDirectory, options)
            // const configYamlPath = path.join(options.extensionDirectory, 'script.config.yml')
            // if (await file.exists(configYamlPath)) {
            //   await file.remove(configYamlPath)
            // }
            return {
              successMessage: `!!! success !!!`,
            }
          },
        },
      ])
      .run()
  }
}
