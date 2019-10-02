import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {InputProjection} from './input-projection/input-projection.component';
import {InputProjectionModule} from './input-projection/input-projection.module';
import {SaraposeComponent} from './sarapose/sarapose.component';
import {SaraposeModule} from './sarapose/sarapose.module';
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
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
