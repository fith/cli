import {cli, path, git, ui} from '@shopify/cli-kit'

export async function rawClone({
  repoUrl,
  destination,
}: {
  repoUrl: string
  destination: string
}) {
  await ui
      .newListr([
        {
          title: `!!! title !!!`,
          task: async () => {
            await git.downloadRepository({
              repoUrl,
              destination,
            })
            return {
              successMessage: `!!! success !!!`,
            }
          },
        },
      ])
      .run()
}

export async function latestClone({
  repoUrl,
  destination,
}: {
  repoUrl: string
  destination: string
}) {
  console.log('latestClone!')
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
