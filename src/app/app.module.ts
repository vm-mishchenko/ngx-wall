import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppComponent} from './app.component';
import {UiComponent} from './ui/ui.component';
import {UiModule} from './ui/ui.module';
import {WallEditorComponent} from './wall-editor/wall-editor.component';
import {WallEditorModule} from './wall-editor/wall-editor.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const routes: Routes = [
    {
        path: 'ui',
        component: UiComponent
    },
    {
        path: '',
        component: WallEditorComponent
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

        // 3rd party lib
        NgbModule.forRoot(),

        // application libraries
        WallEditorModule,
        UiModule,
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
