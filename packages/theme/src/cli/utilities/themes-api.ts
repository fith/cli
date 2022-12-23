import * as throttler from './themes-api/throttler.js'
import {apiCallLimit, retryAfter} from './themes-api/headers.js'
import {retry} from './retry.js'
import {Theme} from '../models/theme.js'
import {api, error, session} from '@shopify/cli-kit'
import {RestResponse} from '@shopify/cli-kit/src/api/admin.js'

type AdminSession = session.AdminSession

export async function fetchThemes(session: AdminSession): Promise<Theme[]> {
  const response = await request('GET', '/themes', session)
  return buildThemes(response)
}

export async function createTheme(session: AdminSession): Promise<Theme | undefined> {
  const response = await request('POST', '/themes', session)
  return buildTheme(response.json)
}

export async function updateTheme(themeId: number, session: AdminSession): Promise<Theme | undefined> {
  const response = await request('PUT', `/themes/${themeId}`, session)
  return buildTheme(response.json)
}

export async function deleteTheme(themeId: number, session: AdminSession): Promise<Theme | undefined> {
  const response = await request('DELETE', `/themes/${themeId}`, session)
  return buildTheme(response.json)
}

async function request(method: string, path: string, session: AdminSession): Promise<RestResponse> {
  const response = await throttler.throttle(() => api.admin.restRequest(method, path, session))

  const status = response.status
  const callLimit = apiCallLimit(response)

  throttler.updateApiCallLimit(callLimit)

  switch (true) {
    case status >= 200 && status <= 399:
      // Returns the successful reponse
      return response
    case status === 404:
      // Defer the decision when a resource is not found
      return response
    case status === 429:
      // Retry following the "retry-after" header
      return retry(() => request(method, path, session), retryAfter(response))
    case status === 401:
      throw new error.Abort(`[${status}] API request unauthorized error`)
    case status === 403:
      throw new error.Abort(`[${status}] API request forbidden error`)
    case status >= 400 && status <= 499:
      throw new error.Abort(`[${status}] API request client error`)
    case status >= 500 && status <= 599:
      throw new error.Abort(`[${status}] API request server error`)
    default:
      throw new error.Abort(`[${status}] API request unexpected error`)
  }
}

function buildThemes(response: RestResponse): Theme[] {
  const themes = response.json?.themes

  if (themes?.length > 0) {
    return themes.map(buildTheme)
  }

  return []
}

// Using `any` to avoid introducing extra DTO layers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTheme(themeJson: any): Theme | undefined {
  if (!themeJson?.id) {
    return undefined
  }

  return new Theme(
    themeJson.id,
    themeJson.name,
    themeJson.created_at,
    themeJson.updated_at,
    themeJson.role,
    themeJson.theme_store_id,
    themeJson.previewable,
    themeJson.processing,
    themeJson.admin_graphql_api_id,
  )
}
