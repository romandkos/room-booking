import { createStore, applyMiddleware, compose } from 'redux'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'

import bookings from 'reducers/bookings'
import floor from 'reducers/floor'

const reducers = combineReducers({ bookings, floor })
export const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk)
  )
)
