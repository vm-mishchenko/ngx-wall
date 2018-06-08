import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ContenteditableDirective} from './contenteditable.directive';

@NgModule({
    imports: [FormsModule],
    exports: [ContenteditableDirective],
    declarations: [ContenteditableDirective]
})
export class ContenteditableModule {
}
