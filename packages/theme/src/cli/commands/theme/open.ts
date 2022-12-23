import {getThemeStore} from '../../utilities/theme-store.js'
import ThemeCommand from '../../utilities/theme-command.js'
import {themeFlags} from '../../flags.js'
import {findOrSelectTheme} from '../../utilities/themes.js'
import {Flags} from '@oclif/core'
import {cli, session} from '@shopify/cli-kit'

export default class Open extends ThemeCommand {
  static description = 'Opens the preview of your remote theme.'

  static flags = {
    ...cli.globalFlags,
    password: themeFlags.password,
    development: Flags.boolean({
      char: 'd',
      description: 'Delete your development theme.',
      env: 'SHOPIFY_FLAG_DEVELOPMENT',
    }),
    editor: Flags.boolean({
      char: 'e',
      description: 'Open the theme editor for the specified theme in the browser.',
      env: 'SHOPIFY_FLAG_EDITOR',
    }),
    live: Flags.boolean({
      char: 'l',
      description: 'Pull theme files from your remote live theme.',
      env: 'SHOPIFY_FLAG_LIVE',
    }),
    theme: Flags.string({
      char: 't',
      description: 'Theme ID or name of the remote theme.',
      env: 'SHOPIFY_FLAG_THEME_ID',
    }),
    store: themeFlags.store,
  }

  static cli2Flags = ['development', 'editor', 'live', 'theme']

  async run(): Promise<void> {
    const {flags} = await this.parse(Open)
    const flagsToPass = this.passThroughFlags(flags, {allowedFlags: Open.cli2Flags})
    const command = ['theme', 'open', ...flagsToPass]

    const store = await getThemeStore(flags)
    const adminSession = await session.ensureAuthenticatedThemes(store, flags.password)

    const theme = await findOrSelectTheme(adminSession, {
      header: 'Select a theme to open',
      // identifier: flags.theme,
    })

    // await execCLI2(command, {adminSession})

    // eslint-disable-next-line no-warning-comments
    // TODO handle theme selection
    if (flags.theme!) {
      // const theme = await findTheme(flags.theme, adminSession)
      // uix
    }
  }
}
