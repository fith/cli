// import {rawClone} from 'init.js'
import {rawClone} from './init.js'
import {beforeEach, describe, expect, it, vi} from 'vitest'

describe('rawClone()', async () => {
  const mockedDownloadRepository = vi.fn(async () => ({}))
  const git = {
    downloadRepository: mockedDownloadRepository,
  }

  beforeEach(() => {
    vi.mock('@shopify/cli-kit', async () => {
      const mockedDownloadRepository = vi.fn()
      const ui = await vi.importActual<typeof import('@shopify/cli-kit')>('@shopify/cli-kit')

      return {
        ui,
        git,
      }
    })
  })

  it('calls downloadRepository function from git service to clone a repo without branch', async () => {
    // Given
    const repoUrl = 'https://github.com/Shopify/dawn.git'
    const destination = 'destination'
    const buySpy = vi.spyOn(git, 'downloadRepository')

    // When
    await rawClone({repoUrl, destination})

    // Then
    expect(buySpy).toHaveBeenCalledWith(repoUrl, destination)
  })
})
