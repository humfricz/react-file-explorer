import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import documentApp from './reducers';

let store = createStore(documentApp);

render(
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById('root'));
