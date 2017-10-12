import { NgModule } from '@angular/core';
import { BrickRegistry } from "../wall/registry/brick-registry.service";
import { DividerBrickComponent } from "./component/divider-brick.component";

@NgModule({
    exports: [DividerBrickComponent],
    declarations: [DividerBrickComponent],
    entryComponents: [DividerBrickComponent]
})
export class DividerBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'd',
            component: DividerBrickComponent
        });
    }
}
