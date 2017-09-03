import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {HeaderBrickModule, TextBrickModule, WallModule} from 'wall';

@NgModule({
    imports: [
        WallModule,
        TextBrickModule,
        HeaderBrickModule,
        CommonModule,
        BrowserModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}