import {fetchThemes} from '../utilities/themes-api.js'
import {Theme} from '../models/theme.js'
import {session} from '@shopify/cli-kit'

export async function list(session: session.AdminSession) {
  const themes = await fetchThemes(session)

  if (themes.length === 0) {
    printEmpty()
  } else {
    await printLines(themes)
  }
}

// async function printHeader(themes: Theme[]) {}

async function printLines(themes: Theme[]) {
  themes.forEach((theme) => {
    // eslint-disable-next-line no-console
    console.log(` - ${theme.id} - ${theme.name}`)
  })
}

function printEmpty() {
  // eslint-disable-next-line no-console
  console.log('no themes')
}
