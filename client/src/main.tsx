import { createRoot } from 'react-dom/client';
import { App } from './app/App.js';
import { Provider } from 'react-redux';
import { store } from '@shared/model';
import './main.css';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
