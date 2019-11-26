import path from 'path';
import webpack from 'webpack';

const appRoot = path.join(__dirname, '../');

export default {
  mode: 'development',
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-redux',
      'react-router-dom',
      'react-transition-group',
      'redux',
      'redux-logger',
      'redux-saga',
      'history',
      'immutable'
    ],
  },

  output: {
    path: path.join(appRoot, 'public', 'dll'),
    filename: '[name].dll.js',
    /**
     * output.library
     * 将会定义为 window.${output.library}
     * 在这次的例子中，将会定义为 `window.vendorLibrary`
     */
    library: '[name]Library',
  },
  plugins: [
    new webpack.DllPlugin({
      /**
       * path
       * 定义 manifest 文件生成的位置
       * [name] 的部分由 entry 的名字替换
       */
      path: path.join(appRoot, 'public', 'dll', '[name]-manifest.json'),
      /**
       * name
       * dll bundle 输出到那个全局变量上
       * 和 output.library 一样即可。
       */
      name: '[name]Library',
    }),
  ],
};
