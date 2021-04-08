import { RawSource } from 'webpack-sources'
import webpack from 'webpack'

const pluginName = 'MiniHtmlWebpackPlugin'

export class MiniHtmlWebpackPlugin {
  #template: string

  constructor (options: { template: string }) {
    this.#template = options.template
  }

  apply (compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.additionalAssets.tap({ name: pluginName },
        (assets) => {
          // @ts-ignore this does exist, the types are just wrong.
          compilation.emitAsset('index.html', new RawSource(this.#template))
        })
    })
  }
}
