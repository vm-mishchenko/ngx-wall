import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {InputProjection} from './input-projection/input-projection.component';
import {InputProjectionModule} from './input-projection/input-projection.module';
import {RichInputComponent} from './rich-input/rich-input.component';
import {RichInputModuleExample} from './rich-input/rich-input.module';
import {SaraposeComponent} from './sarapose/sarapose.component';
import {SaraposeModule} from './sarapose/sarapose.module';
import {StickyModalComponent} from './sticky-modal/sticky-modal.component';
import {StickyModalModule} from './sticky-modal/sticky-modal.module';
import {WallEditorComponent} from './wall-editor/wall-editor.component';
import {WallEditorModule} from './wall-editor/wall-editor.module';

const routes: Routes = [
    {
        path: '',
        component: WallEditorComponent
    },
    {
        path: 'ngx-input-projection',
        component: InputProjection
    },
    {
        path: 'ngx-sticky-modal',
        component: StickyModalComponent
    },
    {
        path: 'ngx-rich-input',
        component: RichInputComponent
    },
    {
        path: 'sarapose',
        component: SaraposeComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,

        // application libraries
        WallEditorModule,
        InputProjectionModule,
        SaraposeModule,
        StickyModalModule,
        RichInputModuleExample,
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
