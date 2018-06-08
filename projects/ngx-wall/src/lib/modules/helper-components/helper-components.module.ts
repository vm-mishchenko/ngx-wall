import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrickInputPlaceholderComponent} from './brick-input-placeholder.component';
import {ItemListComponent} from './item-list/item-list.component';
import {LoadingWrapperComponent} from './loading-wrapper/loading-wrapper.component';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        BrickInputPlaceholderComponent,
        LoadingWrapperComponent,
        ItemListComponent
    ],
    declarations: [
        BrickInputPlaceholderComponent,
        LoadingWrapperComponent,
        ItemListComponent
    ],
    providers: []
})
export class HelperComponentsModule {
}
