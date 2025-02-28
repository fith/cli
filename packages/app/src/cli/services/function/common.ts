import {FunctionExtension} from '../../models/app/extensions.js'
import {App, AppInterface} from '../../models/app/app.js'
import {load as loadApp} from '../../models/app/loader.js'
import {loadExtensionsSpecifications} from '../../models/extensions/specifications.js'
import {FunctionSpec} from '../../models/extensions/functions.js'
import {ExtensionFlavor, TemplateFlavor} from '../generate/extension.js'
import {resolvePath, cwd, joinPath} from '@shopify/cli-kit/node/path'
import {renderFatalError} from '@shopify/cli-kit/node/ui'
import {AbortError} from '@shopify/cli-kit/node/error'
import {Config, Flags} from '@oclif/core'
import {fileExists} from '@shopify/cli-kit/node/fs'

export const functionFlags = {
  path: Flags.string({
    hidden: false,
    description: 'The path to your function directory.',
    parse: async (input) => resolvePath(input),
    default: async () => cwd(),
    env: 'SHOPIFY_FLAG_PATH',
  }),
}

export async function inFunctionContext(
  config: Config,
  path: string,
  callback: (app: App, ourFunction: FunctionExtension) => Promise<void>,
) {
  const specifications = await loadExtensionsSpecifications(config)
  const app: AppInterface = await loadApp({specifications, directory: path})

  const ourFunction = app.extensions.function.find((fun) => fun.directory === path)
  if (ourFunction) {
    return callback(app, ourFunction)
  } else {
    renderFatalError(
      new AbortError('Run this command from a function directory or use `--path` to specify a function directory.'),
    )
  }
}

export async function ensureFunctionExtensionFlavorExists(
  specification: FunctionSpec,
  extensionFlavor: ExtensionFlavor,
  templateFlavor: TemplateFlavor,
  templateDownloadDir: string,
): Promise<string> {
  const templatePath = specification.templatePath(templateFlavor)
  const origin = joinPath(templateDownloadDir, templatePath)
  if (!(await fileExists(origin))) {
    throw new AbortError(`\nExtension '${specification.externalName}' is not available for ${extensionFlavor}`)
  }
  return origin
}
