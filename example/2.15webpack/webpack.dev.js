const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const cssnano = require('cssnano'); // 优化 css，对于长格式优化成短格式等
const autoprefixer = require('autoprefixer');
// 修复 flexbox 已知的 bug
const flexbugs = require('postcss-flexbugs-fixes');
// 根目录上下文
const { URL_CONTEXT } = require('../common/constants');

const hotMiddlewareScript =
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
const appRoot = path.resolve(__dirname, '../');
const appPath = path.resolve(appRoot, 'public');

// webpack config
const webpackConfig = {
  /**
   * 生产下默认设置以下插件，webpack 4 中，一些插件放在 optimization 中设置
   * https://webpack.js.org/concepts/mode
   * - plugins: [
   * -   new webpack.NamedModulesPlugin(),
   * -   new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") }),
   * - ]
   */
  mode: 'development',
  cache: true, // 开启缓存,增量编译
  bail: false, // 设为 true 时如果发生错误，则不继续尝试
  devtool: 'eval-source-map', // 生成 source map文件
  /*
   * Specify what bundle information gets displayed
   * https://webpack.js.org/configuration/stats/
   */
  stats: {
    cached: true, // 显示缓存信息
    cachedAssets: true, // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
    chunks: true, // 显示 chunk 信息（设置为 `false` 仅显示较少的输出）
    chunkModules: true, // 将构建模块信息添加到 chunk 信息
    colors: true,
    hash: true, // 显示编译后的 hash 值
    modules: true, // 显示构建模块信息
    reasons: true, // 显示被导入的模块信息
    timings: true, // 显示构建时间信息
    version: true, // 显示 webpack 版本信息
  },
  /*
   * https://webpack.js.org/configuration/target/#target
   * webpack 能够为多种环境构建编译，默认是 'web'，可省略
   */
  target: 'web',
  resolve: {
    // 自动扩展文件后缀名
    extensions: ['.js', '.scss', '.css', '.png', '.jpg', '.gif'],
    // 模块别名定义，方便直接引用别名
    alias: {},
    // 参与编译的文件
    modules: ['client', 'node_modules'],
  },

  /*
   * 入口文件，让 webpack 用哪个文件作为项目的入口
   * 如果用到了新的 es6 api，需要引入 babel-polyfill，比如 String.prototype 中的方法 includes
   * 所以根据实际需要是否引入 babel-polyfill
   */
  entry: {
    index: ['./client/pages/index.js', hotMiddlewareScript],
  },

  // 出口， 让 webpack 把处理完成的文件放在哪里
  output: {
    // 打包输出目录（必选项, 不能省略）
    path: path.resolve(appPath, 'dist'),
    filename: '[name].bundle.js', // 打包文件名称
    chunkFilename: '[name].chunk.js', // chunk 文件名称
    // 资源上下文路径，可以设置为 cdn 路径，比如 publicPath: 'http://cdn.example.com/assets/[hash]/'
    publicPath: `${URL_CONTEXT}/dist/`,
    pathinfo: true, // 打印路径信息
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    crossOriginLoading: 'anonymous',
  },

  // module 处理
  module: {
    /*
     * Make missing exports an error instead of warning
     * 缺少 exports 时报错，而不是警告
     */
    strictExportPresence: true,

    rules: [
      // https://github.com/MoOx/eslint-loader
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            configFile: '.eslintrc.js',
            // 验证失败，终止
            emitError: true,
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            /*
             * babel-preset-env 的配置可参考 https://zhuanlan.zhihu.com/p/29506685
             * 他会自动使用插件和 polyfill
             */
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  modules: false, // 设为 false，交由 Webpack 来处理模块化
                  /*
                   * 设为 usage 会根据需要自动导入用到的 es6 新方法，而不是一次性的引入 babel-polyfill
                   * 比如使用 Promise 会导入 import "babel-polyfill/core-js/modules/es6.promise";
                   */
                  useBuiltIns: 'usage',
                  debug: true,
                  corejs: 3,
                },
              ],
            ],

            plugins: [
              '@babel/plugin-syntax-dynamic-import', // 支持'import()'
              ['@babel/plugin-proposal-decorators', { legacy: true }], // 编译装饰器语法
              '@babel/plugin-proposal-class-properties', // 解析类属性，静态和实例的属性
              '@babel/plugin-proposal-object-rest-spread', // 支持对象 rest
              [
                '@babel/plugin-transform-runtime',
                {
                  corejs: false, // defaults to false
                  helpers: true, // defaults to true
                  regenerator: true, // defaults to true
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              localIdentName: '[name]_[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [
                cssnano({
                  autoprefixer: false,
                }),
                flexbugs(),
                autoprefixer({
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
        ],
        // publicPath: '/public/dist/' 这里如设置会覆盖 output 中的 publicPath
      },
      
      /*
       * Rules for images
       * https://webpack.js.org/configuration/module/#rule-oneof
       */
      {
        test: /\.(bmp|gif|jpe?g|png|svg)$/,
        oneOf: [
          // 在 css 中的图片处理
          {
            issuer: /\.(css|less|scss)$/, // issuer 表示在这些文件中处理
            oneOf: [
              // svg 单独使用 svg-url-loaderInline 处理，编码默认为 utf-8
              {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                exclude: path.resolve(
                  appRoot,
                  './client/scss/common/_iconfont.scss'
                ), // 除去字体文件
                options: {
                  name: '[path][name].[ext]?[hash:8]',
                  limit: 4096, // 4kb
                },
              },

              /*
               * 其他图片使用 Base64
               * https://github.com/webpack/url-loader
               */
              {
                loader: 'url-loader',
                options: {
                  name: '[path][name].[ext]?[hash:8]',
                  limit: 4096, // 4kb
                },
              },
            ],
          },

          // 在其他地方引入的图片文件使用 file-loader 即可
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]?[hash:8]',
            },
          },
        ],
      },
      // 在其他地方引入的图片文件使用 file-loader 即可
      {
        test: /\.(mp4|ogg|eot|woff2?|ttf)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]?[hash:8]',
        },
      },
    ],
  },

  // webpack 4 新增属性，选项配置，原先的一些插件部分放到这里设置
  optimization: {
    /*
     * 相当于之前的插件 CommonsChunkPlugin
     * 详细说明看这里 https://blog.csdn.net/qq_16559905/article/details/79404173
     * https://juejin.im/post/5b304f1f51882574c72f19b0?utm_source=gold_browser_extension
     */
    splitChunks: {
      cacheGroups: {
        // 这里开始设置缓存的 chunks
        commons: {
          chunks: 'initial', // 必须三选一： "initial" | "all" | "async"(默认为异步)
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors', // 要缓存的分隔出来的 chunk 名称
        },
      },
    },
    namedChunks: true, // 开启后给代码块赋予有意义的名称，而不是数字的 id
  },

  // https://webpack.js.org/concepts/mode/#mode-development
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热部署替换模块
  ],
};

// 判断 dll 文件是否已生成
let dllExist = false;
try {
  fs.statSync(path.resolve(appPath, 'dll', 'vendor.dll.js'));
  dllExist = true;
} catch (e) {
  dllExist = false;
}

if (dllExist) {
  webpackConfig.plugins.push(
    new webpack.DllReferencePlugin({
      context: appPath,
      /**
       * 在这里引入 manifest 文件
       */
      manifest: require('../public/dll/vendor-manifest.json'),
    })
  );
}

module.exports = webpackConfig;
