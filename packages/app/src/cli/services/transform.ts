import * as jscodeshift from 'jscodeshift/src/Runner.js'
import {cwd, dirname, joinPath, resolvePath} from '@shopify/cli-kit/node/path'
import {outputInfo, outputNewline, outputSuccess, outputWarn} from '@shopify/cli-kit/node/output'
import {isClean} from '@shopify/cli-kit/node/git'
import {glob} from '@shopify/cli-kit/node/fs'
import {IPluginInfo, PluginManager} from 'live-plugin-manager'
import {renderSelectPrompt, renderWarning} from '@shopify/cli-kit/node/ui'
import {AbortError} from '@shopify/cli-kit/node/error'
import fs from 'fs'
import {fileURLToPath} from 'url'

const packages = ['@shopify/polaris-codemods']

interface TransformOptions {
  /** Include files that match a provided glob expression */
  include: string

  /** The package to run transforms for, \@scope/package. */
  package?: string

  /** The name of transform */
  transform?: string

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

  const packageName =
    options.package ??
    (await renderSelectPrompt({
      message: 'What package would you like to update with a transform?',
      choices: packages.map((pkg) => {
        return {value: pkg, label: pkg}
      }),
    }))

  const config = await fetchPackageConfig(packageName, packageManager)
  const transforms = {...config.transforms, ...config.presets}

  const transform =
    options.transform ??
    (await renderSelectPrompt({
      message: 'Select a transform to apply.',
      choices: Object.keys(transforms).map((transformName) => {
        return {value: transformName, label: transformName}
      }),
    }))

  const transformPath = Object.entries(transforms).find(([id]) => {
    return transform === id
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
      extensions: 'js, jsx, ts, tsx',
      ignorePattern: '**/node_modules/**',
      parser: 'tsx',
      runInBand: false,
      dry: options.dry,
      print: options.print,
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
  outputInfo(`Attempting to download package: ${packageName}`)
  const config = await fetchPackage(packageName, packageManager)
  outputInfo('Found package.')
  outputNewline()
  return config
}

async function fetchPackage(packageName: string, packageManager: PluginManager): Promise<CodeshiftConfig> {
  async function installPackageDeps(packageName: string, version?: string): Promise<IPluginInfo> {
    await packageManager.install(packageName, version)
    const info = packageManager.getInfo(packageName)
    if (!info) {
      throw new Error(`Unable to locate package files for package: '${packageName}'`)
    }
    const dependencies = Object.entries(info.dependencies)
    await Promise.all(dependencies.map(([pkgName, version]) => installPackageDeps(pkgName, version)))
    return info
  }

  const info = await installPackageDeps(packageName)
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
