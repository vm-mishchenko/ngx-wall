import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

require('./app/resources/scss/index.scss');
require('bootstrap/dist/css/bootstrap.css');
require('open-iconic/font/css/open-iconic-bootstrap.css');
require('ngx-wall/wall.css');

platformBrowserDynamic().bootstrapModule(AppModule);