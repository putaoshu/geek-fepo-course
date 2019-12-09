import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory, hashHistory, useRouterHistory } from 'react-router'
import { configureStore } from './src/store'
import routes from './src/routes'
let state = window.__initialState__ || undefined

const store = configureStore(hashHistory, state)
const history = hashHistory

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('mount')
)
