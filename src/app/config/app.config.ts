import {InjectionToken} from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export const AppConfig = {
  routes: {
    query: 'query',
    setting: 'settings',
    error404: '404'
  },
  settings: {
    couchUrl: 'http://localhost:5984'
  },
  snackBarDuration: 3000,
  repositoryURL: 'https://github.com/fahadmaq007/couchdb-query-builder'
};
