import 'bootstrap/dist/css/bootstrap.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import configureStore from './store/configureStore';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';


// Create browser history to use in the Redux store
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;
const history = createBrowserHistory({ basename: baseUrl });
i18next.init({
    interpolation: { escapeValue: false },  // React already does escaping
});

// Get the application-wide store instance, prepopulating with state from the server where available.
const store = configureStore(history);

//var user = { id: '', firstName: '', lastName: '', email: '', isAuthenticated: false, code: -1, userName: '', role: '', message: '' };

ReactDOM.render(
    
    <I18nextProvider i18n={i18next}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <App />
            </ConnectedRouter>
        </Provider>
    </I18nextProvider>       
    ,
    document.getElementById('root'));

registerServiceWorker();


