import * as jscodeshift from 'jscodeshift/src/Runner.js'
import {cwd, joinPath, resolvePath} from '@shopify/cli-kit/node/path'
import {outputInfo, outputSuccess, outputWarn} from '@shopify/cli-kit/node/output'
import {isClean} from '@shopify/cli-kit/node/git'
import {findPathUp, glob} from '@shopify/cli-kit/node/fs'
import {renderWarning} from '@shopify/cli-kit/node/ui'
import {
  packageManager,
  PackageManager,
  packageManagerUsedForCreating,
  usesWorkspaces,
} from '@shopify/cli-kit/node/node-package-manager'
import {exec} from '@shopify/cli-kit/node/system'
import fs from 'fs'

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

  /** Specify the package manager to use for installing codemod dependencies */
  packageManager?: string | undefined
}

export async function transform(options: TransformOptions) {
  if (!options.dry) {
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
  }

  const filePaths = await glob(options.include, {cwd: cwd()})
  if (filePaths.length === 0) {
    throw new Error(`No files found for ${options.include}`)
  }

  if (!options.package) {
    // Should prompt for package selection here
    // Get from default list
    throw new Error(`No package specified.`)
  }

  const packageManager: PackageManager = inferPackageManager(options.packageManager)
  await installPackage(options.package, packageManager)
  const packagePath = await fetchPackagePath(options.package)
  const config = await fetchConfig(packagePath)

  if (!options.transform) {
    // Should prompt for transform selection here.
    // Get list from selected package
    throw new Error(`No transform specified.`)
  }

  const transforms = {...config.presets, ...config.transforms}
  const transformPath = Object.entries(transforms).find(([id]) => {
    return options.transform === id
  })?.[1]

  if (!transformPath || !fs.existsSync(transformPath)) {
    throw new Error(`No transform found for ${options.transform}`)
  }

  const codeshiftOptions = options.options ? JSON.stringify(options.options) : {}
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
    ...codeshiftOptions,
  })

  outputSuccess('Transform complete.')
  await removePackage(options.package, packageManager)
}

function inferPackageManager(optionsPackageManager: string | undefined): PackageManager {
  if (optionsPackageManager && packageManager.includes(optionsPackageManager as PackageManager)) {
    return optionsPackageManager as PackageManager
  }
  const usedPackageManager = packageManagerUsedForCreating()
  return usedPackageManager === 'unknown' ? 'npm' : usedPackageManager
}

interface CodeshiftConfig {
  description?: string
  transforms?: {[key: string]: string}
  presets?: {[key: string]: string}
}

async function installPackage(packageName: string, packageManager: PackageManager) {
  outputInfo(`Attempting to download npm package: ${packageName}`)
  const useWorkspaceFlag = await usesWorkspaces(cwd())
  const commandMap = {
    pnpm: 'add',
    yarn: 'add',
    npm: 'install',
  } as const

  try {
    await exec(packageManager, [commandMap[packageManager], packageName, useWorkspaceFlag ? '-w' : ''], {cwd: cwd()})
    outputInfo(`Found package: ${packageName}`)
  } catch (error) {
    throw new Error(`Failed to install dependencies for ${packageName}. ${error}`)
  }
}

async function fetchPackagePath(packageName: string) {
  const packagePath = await findPathUp(joinPath('node_modules', packageName), {
    cwd: cwd(),
    type: 'directory',
    allowSymlinks: true,
  })
  if (!packagePath) {
    throw new Error(`Unable to locate package: '${packageName}'`)
  }
  return packagePath
}

async function fetchConfig(packagePath: string): Promise<CodeshiftConfig> {
  const configPath = joinPath(packagePath, 'codeshift.config.js')
  const resolvedConfigPath = resolvePath(configPath)
  const exists = fs.existsSync(resolvedConfigPath)
  if (!exists) {
    throw new Error(`Found package but could not find codeshift.config.js`)
  }
  try {
    const config = await import(resolvedConfigPath)
    return 'default' in config ? config.default : config
  } catch (error) {
    throw new Error(
      `Found config file "${configPath}" but was unable to parse it. This can be caused when transform or preset paths are incorrect.`,
    )
  }
}

async function removePackage(packageName: string, packageManager: PackageManager) {
  outputInfo(`Cleaning up: ${packageName}`)

  try {
    const command = ['pnpm', 'yarn'].includes(packageManager) ? 'remove' : 'uninstall'
    await exec(packageManager, [command, packageName], {cwd: cwd()})
    outputInfo(`Removed package: ${packageName}`)
  } catch (error) {
    throw new Error(`Failed to remove ${packageName}`)
  }
}
