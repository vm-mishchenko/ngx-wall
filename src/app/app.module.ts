import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {AppComponent} from './app.component';
import {WallEditorComponent} from './wall-editor/wall-editor.component';
import {WallEditorModule} from './wall-editor/wall-editor.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const routes: Routes = [
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

        // application libraries
        WallEditorModule,
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
