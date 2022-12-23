import {getThemeStore} from '../../utilities/theme-store.js'
import {themeFlags} from '../../flags.js'
import ThemeCommand from '../../utilities/theme-command.js'
import {list} from '../../services/list.js'
import {cli, session} from '@shopify/cli-kit'
import {Flags} from '@oclif/core'

export default class List extends ThemeCommand {
  static description = 'Lists your remote themes.'

  static flags = {
    ...cli.globalFlags,
    password: themeFlags.password,
    store: themeFlags.store,
    theme: Flags.string({
      char: 't',
      description: 'Theme ID or name of the remote theme.',
      env: 'SHOPIFY_FLAG_THEME_ID',
      multiple: true,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const store = await getThemeStore(flags)
    const adminSession = await session.ensureAuthenticatedThemes(store, flags.password)

    await list(adminSession)
  }
}
