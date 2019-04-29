const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const common = require('./webpack.config')

module.exports = merge({
  entry: {
    'app': './src/index.js',
  }
},
common, {

  output: {
    path: path.join(__dirname, '/dest/dev'),
    filename: '[name].js'
  },

  plugins: [
    new CleanWebpackPlugin(['dest/dev']),
    new MiniCssExtractPlugin({
      filename: './css/style.css'
    })
  ],

  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },

  // devtool: 'inline-source-map',
  mode: 'production',
  devServer: {
    contentBase: path.join(__dirname, './dest/dev'),
    compress: true,
    port: 9009,
    host: '172.26.40.129'
  }
});
