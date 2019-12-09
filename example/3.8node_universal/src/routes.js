import React from 'react'
import { Route, IndexRoute, Link } from 'react-router'

import App from './containers/App'
import Home from './containers/Home'

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Home}/>
  </Route>
)

export default routes
