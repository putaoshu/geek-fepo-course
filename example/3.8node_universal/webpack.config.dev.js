const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    //Hot Module Replacement(HMR)
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=10000&reload=true',
    './client'
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public'),
    publicPath: '/public/'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel-loader']
        //,query: {presets: ['es2015', 'react', 'stage-1']} //replace ".babelrc" file 
      },
      {
        test: /\.css$/i,
        loader: ExtractTextPlugin.extract('style',
          `css?modules&localIdentName=[name]_[local]__[hash:base64:5]!postcss`),
      }
    ]
  },
  postcss: [ 
    autoprefixer({ browsers: ['last 2 versions'] }) 
  ],
  plugins: [
    new ExtractTextPlugin('style.css', { allChunks: true }),
    //optimize files
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    //has error no exit
    new webpack.NoErrorsPlugin()
  ]
};