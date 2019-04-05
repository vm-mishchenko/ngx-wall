import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PlaceholderComponent} from './component/placeholder.component';
import {PlaceholderRenderer} from './placeholder-renderer.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PlaceholderComponent
    ],
    providers: [
        PlaceholderRenderer
    ],
    entryComponents: [
        PlaceholderComponent
    ]
})
export class PlaceholderRendererModule {
}
