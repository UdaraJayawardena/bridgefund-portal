import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers.js';

let store = null;

const initializeStore = () => {
  if (!store) {
    store = process.env.NODE_ENV === 'development' ?
      createStore(reducers, composeWithDevTools(applyMiddleware(thunkMiddleware))) : createStore(reducers, applyMiddleware(thunkMiddleware));
  }
  // console.log(store.getState())
  return store;
};

export default initializeStore;