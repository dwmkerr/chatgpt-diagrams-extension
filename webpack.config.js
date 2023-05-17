import fs from 'fs';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  cache: {
    type: 'filesystem',
  },
  entry: {
    options: './src/options.ts',
    content: './src/content.ts',
  },
  output: {
    publicPath: '',
    path: path.join(process.cwd(), 'dist'),
    filename: '[name].js',
    clean: true,
    asyncChunks: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/options.html",
      filename: "options.html",
      chunks: ['options'],
      hash: true,
      inject: true,
    }),
    new CopyPlugin({
      patterns: [
        "src/manifest.json",
        { from: "src/images", to: "images" },
      ],
    }),
    //  if we choose to use the plugin...
    //  import ChromeExtensionManifest from 'chrome-extension-manifest-webpack-plugin';
    //  Load the package.json file to get metadata.
    //  const pack = JSON.parse(fs.readFileSync('./package.json'));
    // new ChromeExtensionManifest({
    //   inputFile: './src/manifest.json',
    //   outputFile: 'manifest.json',
    //   props: {
    //     version: pack.version,
    //   },
    // }),
  ],
  optimization: {
    splitChunks: false,
  },
  //  These hints tell webpack that we can expect much larger than usual assets
  //  and entry points (as we compile things down to a few small files, this is
  //  ok as we load the extension from disk not the web).
  performance: {
    maxEntrypointSize: 5*1024*1024,
    maxAssetSize: 5*1024*1024,
  }
};
