const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = {
  entry: './src/MG.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [new BundleAnalyzerPlugin()],
  output: {
    filename: 'umd/bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'MG',
    libraryTarget: 'umd'
  }
}
