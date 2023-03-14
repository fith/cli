import * as jscodeshift from 'jscodeshift/src/Runner.js'
import {cwd, dirname, joinPath, resolvePath} from '@shopify/cli-kit/node/path'
import {outputInfo, outputSuccess, outputWarn} from '@shopify/cli-kit/node/output'
import {isClean} from '@shopify/cli-kit/node/git'
import {glob} from '@shopify/cli-kit/node/fs'
import {IPluginInfo, PluginManager} from 'live-plugin-manager'
import {renderWarning} from '@shopify/cli-kit/node/ui'
import {AbortError} from '@shopify/cli-kit/node/error'
import fs from 'fs'
import {fileURLToPath} from 'url'

interface TransformOptions {
  /** Include files that match a provided glob expression */
  include: string

  /** The package to run transforms for, \@scope/package. */
  package?: string

  /** The name of transform */
  transform?: string

  /** Parser to use for parsing the source files */
  parser?: string

  /** Transform files with these file extensions (comma separated list) */
  extensions?: string

  /** Ignore files that match a provided glob expression */
  ignore?: string

  /** Start at most N child processes to process source files */
  cpus?: string

  /** Run serially in the current process */
  runInBand?: boolean

  /** If true, no code will be edited */
  dry?: boolean

  /** Show more information about the transform process */
  verbose?: boolean

  /** If true, the changed output is printed for comparison */
  print?: boolean

  /** If true, bypass Git safety checks and forcibly run transform */
  force?: boolean

  /** Add transform-specific options as a JSON string. These are parsed into a JS object and passed to the transform function */
  transformOptions?: string
}

export async function transform(options: TransformOptions) {
  const clean = await isClean(cwd())
  if (!clean) {
    if (options.force) {
      outputWarn('Forcibly continuing')
    } else {
      renderWarning({
        headline: 'Before we continue, please stash or commit your git changes.',
        body: 'You may use the --force flag to override this safety check.',
      })
      return
    }
  }

  const filePaths = await glob(options.include, {cwd: cwd()})
  if (filePaths.length === 0) {
    throw new AbortError(`No files found for ${options.include}`)
  }

  const packageManager = new PluginManager({
    cwd: cwd(),
    pluginsPath: joinPath(dirname(fileURLToPath(import.meta.url)), 'node_modules'),
  })

  if (!options.package) {
    // Should prompt for package selection here
    // Get from default list
    throw new AbortError(`No package specified.`)
  }

  if (!options.transform) {
    // Should prompt for transform selection here.
    // Get list from selected package
    throw new Error(`No transform specified.`)
  }

  const config = await fetchPackageConfig(options.package, packageManager)
  const transforms = {...config.presets, ...config.transforms}
  const transformPath = Object.entries(transforms).find(([id]) => {
    return options.transform === id
  })?.[1]

  let transformOptions = {}
  if (options.transformOptions) {
    try {
      transformOptions = JSON.parse(options.transformOptions)
    } catch (error) {
      throw new AbortError(`Failed to parse transform options: ${error}`)
    }
  }

  if (!transformPath || !fs.existsSync(transformPath)) {
    throw new AbortError(`No transform found for ${options.transform}`)
  }

  try {
    const res = await jscodeshift.run(transformPath, filePaths, {
      babel: true,
      silent: true,
      stdin: true,
      ignoreConfig: [],
      cpus: options.cpus,
      dry: options.dry,
      extensions: options.extensions,
      ignorePattern: options.ignore,
      parser: options.parser,
      print: options.print,
      runInBand: options.runInBand,
      verbose: options.verbose ? 2 : 0,
      ...transformOptions,
    })

    outputSuccess(`
  Not changed: ${res.nochange}
  Skipped: ${res.skip}
  Errors: ${res.error}
  Success: ${res.ok}
  Time elapsed: ${res.timeElapsed}`)
  } catch (error) {
    throw new AbortError(`Failed to execute transform ${transform}`)
  }
}

interface CodeshiftConfig {
  description?: string
  transforms?: {[key: string]: string}
  presets?: {[key: string]: string}
}

export async function fetchPackageConfig(packageName: string, packageManager: PluginManager) {
  outputInfo(`Attempting to download npm package: ${packageName}`)
  const config = await fetchPackage(packageName, packageManager)
  outputInfo(`Found package: ${packageName}`)
  return config
}

async function fetchPackage(packageName: string, packageManager: PluginManager): Promise<CodeshiftConfig> {
  await packageManager.install(packageName)
  const info = packageManager.getInfo(packageName)
  if (!info) {
    throw new Error(`Unable to locate package files for package: '${packageName}'`)
  }
  return fetchConfig(info)
}

async function fetchConfig(packageInfo: IPluginInfo): Promise<CodeshiftConfig> {
  const configPath = packageInfo.mainFile.includes('codeshift.config.js')
    ? packageInfo.mainFile
    : joinPath(packageInfo.location, 'codeshift.config.js')
  const resolvedConfigPath = resolvePath(configPath)
  const exists = fs.existsSync(resolvedConfigPath)
  if (!exists) {
    throw new Error(`Found package but could not find codeshift.config.js`)
  }
  try {
    const config = await import(resolvedConfigPath)
    return 'default' in config ? config.default : config
  } catch (error) {
    throw new AbortError(
      `Found config file "${configPath}" but was unable to parse it. This can be caused when transform or preset paths are incorrect.`,
    )
  }
}
