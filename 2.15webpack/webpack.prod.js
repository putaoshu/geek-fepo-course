import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import autoprefixer from 'autoprefixer';
import flexbugs from 'postcss-flexbugs-fixes'; // 修复 flexbox 已知的 bug
import cssnano from 'cssnano'; // 优化 css，对于长格式优化成短格式等
import getCSSModuleLocalIdent from './webpack/getCSSModuleLocalIdent';

// 根目录上下文
import { URL_CONTEXT } from '../common/constants';

const appRoot = path.resolve(__dirname, '../');
const appPath = path.resolve(appRoot, 'public');

// 是否做 webpack bundle 分析
const isAnalyze = process.env.ANALYZE === 'true';

// 基于 webpack 的持久化缓存方案 可以参考 https://github.com/pigcan/blog/issues/9
const webpackConfig = {
  /**
   * 生产下默认设置以下插件，webpack 4 中，一些插件放在 optimization 中设置
   * https://webpack.js.org/concepts/mode
   * plugins: [
   * new UglifyJsPlugin(),
   * new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
   * new webpack.optimize.ModuleConcatenationPlugin(),
   * new webpack.NoEmitOnErrorsPlugin()
   * ]
   */
  mode: 'production',
  cache: false, // 开启缓存,增量编译
  // 默认为 false。设为 true 时如果发生错误，则不继续尝试，直接退出 bundling process
  bail: true,
  devtool: 'source-map', // 生成 source-map 文件
  /*
   * Specify what bundle information gets displayed
   * https://webpack.js.org/configuration/stats/
   */
  stats: {
    cached: false, // 显示缓存信息
    cachedAssets: false, // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
    chunks: false, // 显示 chunk 信息（设置为 `false` 仅显示较少的输出）
    chunkModules: false, // 将构建模块信息添加到 chunk 信息
    colors: true,
    hash: false, // 显示编译后的 hash 值
    modules: false, // 显示构建模块信息
    reasons: false, // 显示被导入的模块信息
    timings: true, // 显示构建时间信息
    version: false, // 显示 webpack 版本信息
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
    index: ['./client/pages/index.js'],
  },

  // 出口 让 webpack 把处理完成的文件放在哪里
  output: {
    // 打包输出目录（必选项, 不能省略）
    path: path.resolve(appPath, 'dist'),
    filename: '[name].[chunkhash:8].js',
    //chunkFilename: '[name].[chunkhash:8].chunk.js',
    // 资源上下文路径，可以设置为 cdn 路径，比如 publicPath: 'http://cdn.example.com/assets/[hash]/'
    publicPath: `${URL_CONTEXT}/dist/`,
    pathinfo: false, // 打印路径信息
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    sourceMapFilename: 'map/[file].map',
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
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
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
              // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
              '@babel/plugin-transform-react-constant-elements',
              // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
              '@babel/plugin-transform-react-inline-elements',
              [
                'transform-react-remove-prop-types',
                {
                  mode: 'remove', // 默认值为 remove ，即删除 PropTypes
                  removeImport: true, // the import statements are removed as well. import PropTypes from 'prop-types'
                  ignoreFilenames: ['node_modules'],
                },
              ],
            ],
          },
        },
      },
      // css 一般都是从第三方库中引入，故不需要 CSS 模块化处理
      {
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              minimize: {
                discardComments: { removeAll: true },
              },
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
                // 除去字体文件
                exclude: path.resolve(
                  appRoot,
                  './client/scss/common/_iconfont.scss'
                ), // 除去字体文件
                options: {
                  name: '[hash:8].[ext]',
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
                  name: '[hash:8].[ext]',
                  limit: 4096, // 4kb
                },
              },
            ],
          },

          // 在其他地方引入的图片文件使用 file-loader 即可
          {
            loader: 'file-loader',
            options: {
              name: '[hash:8].[ext]',
            },
          },
        ],
      },
      // 在其他地方引入的图片文件使用 file-loader 即可
      {
        test: /\.(mp4|ogg|eot|woff2?|ttf)$/,
        loader: 'file-loader',
        options: {
          name: '[hash:8].[ext]',
        },
      },
    ],
  },

  /*
   * webpack 4 新增属性，选项配置，原先的一些插件部分放到这里设置
   * 优化可以参考这里 https://zhuanlan.zhihu.com/p/35258448
   */
  optimization: {
    removeEmptyChunks: true, // 空的块chunks会被移除。这可以减少文件系统的负载并且可以加快构建速度。
    mergeDuplicateChunks: true, // 相同的块被合并。这会减少生成的代码并缩短构建时间。
    occurrenceOrder: true, // Webpack将会用更短的名字去命名引用频度更高的chunk
    sideEffects: true, // 剔除掉没有依赖的模块
    // 为 webpack 运行时代码和 chunk manifest 创建一个单独的代码块。这个代码块应该被内联到 HTML 中，生产环境不需要
    runtimeChunk: false,
    // 开启后给代码块赋予有意义的名称，而不是数字的 id
    namedChunks: false,
    // https://github.com/webpack-contrib/mini-css-extract-plugin#minimizing-for-production
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // set to true if you want JS source maps
        uglifyOptions: {
          // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
          compress: {
            /* eslint-disable camelcase */
            drop_console: true,
          },
          mangle: {
            reserved: [''], // 设置不混淆变量名
          },
          // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      cacheGroups: {
        // 这里开始设置缓存的 chunks
        commons: {
          chunks: 'initial', // 必须三选一： "initial" | "all" | "async"(默认为异步)
          test: /[\\/]node_modules[\\/]/, // 合并指定的模块，这里只 node_modules 下所有公共的，也可以设为 /react|babel/ 等
          name: 'vendors', // 要缓存的分隔出来的 chunk 名称
        },
        // 所有的 css 生成一个文件，这样只需第一次加载 css 文件，后续不需要按需加载，这样体验可能会更好些，如果需要按需加载的话，可以把这个去掉，同时 server 端引入 css 和 js 也需要调整，怎样调整可以查看历史版本
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },

  plugins: [
    // 用来优化生成的代码 chunk，合并相同的代码
    new webpack.optimize.AggressiveMergingPlugin(),
    /*
     * 开启 mode 后不需要设置
     * new webpack.DefinePlugin({
     *   'process.env': {
     *     NODE_ENV: JSON.stringify('production'),
     *   },
     * }),
     */
    new MiniCssExtractPlugin({
      /*
       * Options similar to the same options in webpackOptions.output
       * both options are optional
       * css/[name].[contenthash:8].css
       */
      filename: 'css/[name].[contenthash:8].css',
      // chunkFilename: 'css/[id].[contenthash:8].css',
    }),
    new webpack.HashedModuleIdsPlugin(),
    new ManifestPlugin({
      basePath: `${URL_CONTEXT}/dist/`,
    }),
    new webpack.BannerPlugin({
      banner: [
        '/*!',
        ' react-redux-router-base',
        ` Copyright © 2019-${new Date().getFullYear()}`,
        '*/',
      ].join('\n'),
      raw: true,
      entryOnly: true,
    }),
    ...(isAnalyze
      ? [
          new BundleAnalyzerPlugin(), // Webpack Bundle Analyzer: https://github.com/th0r/webpack-bundle-analyzer
        ]
      : []),
  ],
};

export default webpackConfig;
