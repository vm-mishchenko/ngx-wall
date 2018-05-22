import {CommonModule} from '@angular/common';
import {Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {WALL_PLUGIN, WallApi} from 'ngx-wall';
import {Subscription} from 'rxjs';
import {AppComponent} from './app.component';
import {DebugService} from './debug/debug.service';
import {UiComponent} from './ui/ui.component';
import {UiModule} from './ui/ui.module';
import {WallEditorComponent} from './wall-editor/wall-editor.component';
import {WallEditorModule} from './wall-editor/wall-editor.module';

@Injectable()
class LoggerPlugin {
    constructor(wallApi: WallApi) {
        wallApi.registerFeatureApi('logger', {
            log: (message: string) => {
                // console.log(message);
            }
        });
    }
}

@Injectable()
class EventLoggerPlugin {
    private apiSubscription: Subscription;

    constructor(wallApi: WallApi) {
        this.apiSubscription = wallApi.core.subscribe((event: any) => {
            wallApi.features.logger.log(event);
        });
    }

    destroy() {
        this.apiSubscription.unsubscribe();

        this.apiSubscription = null;
    }
}

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
    imports: [
        NgbModule.forRoot(),
        CommonModule,
        BrowserModule,
        UiModule,
        WallEditorModule,
        RouterModule.forRoot(routes, {useHash: true})
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
