import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

require('bootstrap/dist/css/bootstrap.css');
require('open-iconic/font/css/open-iconic-bootstrap.css');
require('wall/wall.css');

platformBrowserDynamic().bootstrapModule(AppModule);