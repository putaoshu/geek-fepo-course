import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from './webpack.config.dev'

const app = express();

var compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
    hot: true,
    noInfo: true,//no deploy info
    historyApiFallback: true
}));

//hmr
app.use(webpackHotMiddleware(compiler, {
	log: console.log, 
	path: '/__webpack_hmr', 
	heartbeat: 10 * 1000
}));

app.use('/public', express.static(__dirname + '/public'))

//entry files --> index.dev.html
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.dev.html'));
});

app.listen(3002, 'localhost', function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('==> 🌎  listening on http://localhost:3002')
})