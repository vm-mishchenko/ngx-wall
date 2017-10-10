import { NgModule } from '@angular/core';
import { BrickRegistry } from "../wall/registry/brick-registry.service";
import { QuoteBrickComponent } from "./component/quote-brick.component";

@NgModule({
    exports: [QuoteBrickComponent],
    declarations: [QuoteBrickComponent],
    entryComponents: [QuoteBrickComponent]
})
export class QuoteBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'quote',
            component: QuoteBrickComponent
        });
    }
}
