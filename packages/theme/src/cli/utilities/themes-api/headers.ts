import {RestResponse} from '@shopify/cli-kit/src/api/admin.js'

export function retryAfter(response: RestResponse): number {
  const retryAfter = parseInt(header(response, 'retry-after'), 10)
  if (isNaN(retryAfter)) {
    return 0
  }

  return retryAfter
}

export function apiCallLimit(response: RestResponse): [number, number] | undefined {
  const apiCallLimit = header(response, 'x-shopify-shop-api-call-limit')

  const [used, limit] = apiCallLimit
    .split('/')
    .map((num) => parseInt(num, 10))
    .filter((num) => !isNaN(num))

  if (used === undefined || limit === undefined) {
    return
  }

  return [used, limit]
}

function header(response: RestResponse, name: string): string {
  const headers = response.headers
  const header = headers[name]

  if (header?.length === 1) {
    return header[0] ?? ''
  }

  return ''
}
