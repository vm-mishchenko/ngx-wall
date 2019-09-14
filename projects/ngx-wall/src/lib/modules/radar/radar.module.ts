import {NgModule} from '@angular/core';
import {SpotDirective} from './spot.directive';

@NgModule({
    exports: [SpotDirective],
    declarations: [SpotDirective],
})
export class RadarModule {
}
