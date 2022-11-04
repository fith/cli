import {git, ui} from '@shopify/cli-kit'

export async function rawClone({repoUrl, destination}: {repoUrl: string; destination: string}) {
  // eslint-disable-next-line no-console
  console.log(repoUrl, destination)
  await ui
    .newListr([
      {
        title: `Cloning ${repoUrl} into ${destination}`,
        task: async () => {
          await git.downloadRepository({
            repoUrl,
            destination,
          })
          return {
            successMessage: `Cloned into ${destination}`,
          }
        },
      },
    ])
    .run()
}

export async function latestClone({repoUrl, destination}: {repoUrl: string; destination: string}) {
  // eslint-disable-next-line no-console
  console.log(repoUrl, destination)
  // console.log('latestClone!')
}

// async themeInit(destination: string) {
//   const url = 'https://github.com/Shopify/dawn.git'

//   await ui
//     .newListr([
//       {
//         title: `!!! title !!!`,
//         task: async () => {
//           await git.downloadRepository({
//             repoUrl: url,
//             destination,
//             shallow: false,
//           })
//           // const origin = path.join(templateDownloadDir, functionTemplatePath(options))
//           // await template.recursiveDirectoryCopy(origin, options.extensionDirectory, options)
//           // const configYamlPath = path.join(options.extensionDirectory, 'script.config.yml')
//           // if (await file.exists(configYamlPath)) {
//           //   await file.remove(configYamlPath)
//           // }
//           return {
//             successMessage: `!!! success !!!`,
//           }
//         },
//       },
//     ])
//     .run()
// }
