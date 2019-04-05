import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {ImgBrickComponent} from './component/img-brick.component';
import {InputContextComponent} from './input-context/input-context.component';
import {ImgModel} from './img-brick-destructor.class';
import {ImgBrickState} from './img-brick-state.interface';
import {ImgBrickTextRepresentation} from './img-brick-text-representation.class';
import {MatButtonModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {ResizableModule} from '../../modules/resizable/resizable.module';
import {TowModule} from '../../modules/tow/tow.module';
import {HelperComponentsModule} from '../../modules/helper-components/helper-components.module';
import {IBrickSnapshot} from '../../wall/model/interfaces/brick-snapshot.interface';
import {BrickRegistry} from '../../wall/registry/brick-registry.service';

@NgModule({
    imports: [
        CommonModule,
        HelperComponentsModule,
        ResizableModule,
        TowModule,
        StickyModalModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule
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

            getBrickResourcePaths: (brickSnapshot: IBrickSnapshot) => {
                const imageState: ImgBrickState = brickSnapshot.state;

                if (imageState.metadata && imageState.metadata.path) {
                    return [imageState.metadata.path];
                }

                return [];
            },

            name: 'Image',
            description: 'Embed with a link'
        });
    }
}
