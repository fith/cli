import {fetchThemes} from './themes-api.js'
import {Theme} from '../models/theme.js'
import {error, session, uix} from '@shopify/cli-kit'

type AdminSession = session.AdminSession

/**
 * {@link Theme} ID or name
 */
type Identifier = string

interface Query {
  identifiers?: Identifier[]

  development?: boolean

  live?: boolean
}

/**
 * Finds or selects a theme in the store.
 *
 * @param session - current Admin session
 * @param options - {@link Options}
 *
 * @returns the selected {@link Theme}
 */
export async function findOrSelectTheme(session: AdminSession, options: {header?: string; query?: Query}) {
  const themes = await fetchStoreThemes(session)
  const store = session.storeFqdn
  const query = options.query
  const header = options.header ?? 'Select a theme'

  if (query && hasFilter(query)) {
    return findThemesByQuery(store, themes, query)[0]!
  }

  return selectTheme(header, themes)
}

/**
 * Finds themes in the store.
 *
 * @param session - current Admin session
 * @param identifiers - list of identifiers
 *
 * @returns the selected {@link Theme}
 */
export async function findThemes(session: AdminSession, query: Query) {
  const themes = await fetchStoreThemes(session)
  const store = session.storeFqdn

  if (query && hasFilter(query)) {
    return findThemesByQuery(store, themes, query)
  }

  return []
}

async function selectTheme(message: string, themes: Theme[]) {
  const choices = themes.map((theme) => {
    return {
      value: theme.id,
      label: theme.name,
    }
  })

  const themeId = await uix.renderPrompt({
    message,
    choices,
  })

  return themes.find((theme) => theme.id === themeId)!
}

async function fetchStoreThemes(session: AdminSession) {
  const themes = await fetchThemes(session)
  const store = session.storeFqdn

  if (themes.length === 0) {
    throw new error.Abort(`There are no themes in the ${store} store`)
  }

  return themes
}

function findThemesByQuery(store: string, themes: Theme[], query: Query): Theme[] {
  const {live, development, identifiers} = query

  if (live) {
    throw new Error('TODO: implement live logic')
  }

  if (development) {
    throw new Error('TODO: implement development logic')
  }

  if (identifiers) {
    const identifiedThemes: Theme[] = identifiers
      .filter(Boolean)
      .map((identifier) => findByIdentfier(store, themes, identifier))

    if (identifiedThemes) {
      return identifiedThemes
    }
  }

  // Unexpected error
  throw new error.AbortSilent()
}

function findByIdentfier(store: string, themes: Theme[], identifier: Identifier) {
  const theme = themes.find((theme) => {
    return [theme.id.toString(), theme.name].includes(identifier)
  })

  if (theme) {
    return theme
  }

  throw new error.Abort(`The ${store} store doesn't have a theme with the "${identifier}" ID or name`)
}

function hasFilter(query: Query) {
  return Object.values(query).some(Boolean)
}
