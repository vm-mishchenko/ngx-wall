import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FileUploaderModule} from '../../modules/file-uploader';
import {ModalModule} from '../../modules/modal';
import {ResizableModule} from '../../modules/resizable';
import {TowModule} from '../../modules/tow';
import {BrickRegistry, HelperComponentsModule, IBrickSnapshot} from '../../wall';
import {ImgBrickComponent} from './component/img-brick.component';
import {InputContextComponent} from './component/input-context.component';
import {ImgModel} from './img-brick-destructor.class';
import {ImgBrickTextRepresentation} from './img-brick-text-representation.class';

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        HelperComponentsModule,
        ResizableModule,
        TowModule,
        FileUploaderModule
    ],
    exports: [ImgBrickComponent],
    declarations: [ImgBrickComponent, InputContextComponent],
    entryComponents: [ImgBrickComponent, InputContextComponent],
    providers: [
        ImgModel
    ]
})
export class ImgBrickModule {
    constructor(private brickRegistry: BrickRegistry,
                private imgModel: ImgModel) {
        this.brickRegistry.register({
            tag: 'image',
            component: ImgBrickComponent,
            textRepresentation: ImgBrickTextRepresentation,

            destructor: (brickSnapshot: IBrickSnapshot): Promise<void> => {
                return this.imgModel.remove(brickSnapshot);
            },

            name: 'Image',
            description: 'Embed with a link'
        });
    }
}
