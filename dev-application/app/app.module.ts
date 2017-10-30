import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {
    DividerBrickModule,
    HeaderBrickModule,
    ImgBrickModule,
    PickOutModule,
    QuoteBrickModule,
    TextBrickModule,
    TowModule,
    VideoBrickModule,
    WALL_PLUGIN,
    WallApi,
    WallModule
} from 'wall';
import { DebugService } from "./debug/debug.service";

@Injectable()
class LoggerPlugin {
    constructor(wallApi: WallApi) {
        wallApi.registerFeatureApi('logger', {
            log: function (message: string) {
                console.log(message);
            }
        });
    }
}

@Injectable()
class EventLoggerPlugin {
    constructor(wallApi: WallApi) {
        wallApi.core.subscribe((event: any) => {
            wallApi.features.logger.log(event);
        });
    }
}

@NgModule({
    imports: [
        TowModule,
        WallModule,
        PickOutModule,
        QuoteBrickModule,
        TextBrickModule,
        DividerBrickModule,
        VideoBrickModule,
        HeaderBrickModule,
        ImgBrickModule,
        CommonModule,
        BrowserModule
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        DebugService,
        {
            provide: WALL_PLUGIN, useValue: LoggerPlugin, multi: true
        },
        {
            provide: WALL_PLUGIN, useValue: EventLoggerPlugin, multi: true
        }
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    constructor(private debugService: DebugService) {
        this.debugService.enableDebugTools(); // ng.profiler.timeChangeDetection()
    }
}