import React from 'react'

import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'

export function configureStore(history, initialState) {

  const reducer = combineReducers({
    routing: routerReducer
  })

  const store = createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(
        thunkMiddleware,
        routerMiddleware(history)
      )
    )
  )

  return store
}
