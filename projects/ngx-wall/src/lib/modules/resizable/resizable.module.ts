import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ResizableHandlerComponent} from './resizable-handler.component';
import {ResizableDirective} from './resizable.directive';

@NgModule({
    imports: [CommonModule],
    exports: [ResizableDirective],
    declarations: [ResizableDirective, ResizableHandlerComponent],
    entryComponents: [ResizableHandlerComponent]
})
export class ResizableModule {
}
