//依赖库
import express from 'express'
import serialize from 'serialize-javascript'
import React from 'react'

//将React元素渲染为其初始HTML。React将返回一个HTML字符串。可以使用此方法在服务器上生成HTML
import { renderToString } from 'react-dom/server'

import { Provider } from 'react-redux'
import { createMemoryHistory, match, RouterContext } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

//引入store和routes
import { configureStore } from './src/store'
import routes from './src/routes'

const app = express()
app.use('/public', express.static(__dirname + '/public'))

//拼接页面模板 也可以设置在源码文件中
const HTML = ({ content, store }) => (
  <html>
    <head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>
      <link rel='stylesheet' type='text/css' href='/public/style.css' />
    </head>
    <body>
      <div id='mount' dangerouslySetInnerHTML={{ __html: content }}/>
      <script dangerouslySetInnerHTML={{ __html: `window.__initialState__=${serialize(store.getState())};` }}/>
      <script src='/public/vendor.js' />
      <script src='/public/bundle.js' />
    </body>
  </html>
)

app.use(function (req, res) {

  const memoryHistory = createMemoryHistory(req.path)
  let store = configureStore(memoryHistory )
  const history = syncHistoryWithStore(memoryHistory, store)

  /* react router match history */
  match({ history, routes , location: req.url }, (error, redirectLocation, renderProps) => {

    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      
      /* call static fetchData on the container component */
        store = configureStore(memoryHistory, store.getState() )
        const content = renderToString(
          <Provider store={store}>
            <RouterContext {...renderProps}/>
          </Provider>
        )
        res.status(200).send('<!Doctype html>\n' + renderToString(<HTML content={content} store={store}/>))
      
    } else {
      res.sendStatus(404);
    }
  })
})

let env = process.env.NODE_ENV || 'prod'
let appPort = 3002;
if(env === 'prod'){
  appPort = 3003;
}

app.listen(appPort, 'localhost', function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('==> 🌎  listening on http://localhost:'+appPort)
})