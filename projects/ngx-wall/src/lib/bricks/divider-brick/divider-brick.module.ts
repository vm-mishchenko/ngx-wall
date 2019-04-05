import {NgModule} from '@angular/core';
import {BrickRegistry} from '../../wall/wall';
import {DividerBrickComponent} from './component/divider-brick.component';
import {DIVIDER_BRICK_TAG} from './divider-brick.constant';

@NgModule({
    exports: [DividerBrickComponent],
    declarations: [DividerBrickComponent],
    entryComponents: [DividerBrickComponent]
})
export class DividerBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: DIVIDER_BRICK_TAG,
            component: DividerBrickComponent,
            name: 'Divider',
            description: 'Visually divide blocks'
        });
    }
}
