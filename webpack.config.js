const HtmlWebpackPLugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    'lib/webOS': './src/lib/webOSTV.js'
  },
  plugins: [
    new HtmlWebpackPLugin({
      filename: './index.html',
      template: './src/index.html',
      chunksSortMode: 'manual',
      chunks: ['lib/webOS', 'lib/pcm-player', 'app']
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-2']
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'img/[name].[ext]',
            publicPath: '../'
          }
        }]
      },
      {
        test: /\.(ttf|eot|woff|otf|woff2)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'fonts/[name].[ext]',
            publicPath: '../'
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.html', '.scss']
  }
};
