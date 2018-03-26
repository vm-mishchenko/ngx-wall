import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrickInputPlaceholderComponent } from './brick-input-placeholder.component';
import { LoadingWrapperComponent } from './loading-wrapper/loading-wrapper.component';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        BrickInputPlaceholderComponent,
        LoadingWrapperComponent
    ],
    declarations: [
        BrickInputPlaceholderComponent,
        LoadingWrapperComponent
    ],
    providers: []
})
export class HelperComponentsModule {
}
