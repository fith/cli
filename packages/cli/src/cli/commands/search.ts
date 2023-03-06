import {searchService} from '../services/commands/search.js'
import Command from '@shopify/cli-kit/node/base-command'

export default class Search extends Command {
  static description = 'Starts a search on shopify.dev.'

  async run(): Promise<void> {
    const {args} = await this.parse(Search)
    console.log(args)
    await searchService(args.arg)
  }
}
