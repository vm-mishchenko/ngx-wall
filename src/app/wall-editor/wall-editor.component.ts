import {Component, Injector, OnInit} from '@angular/core';
import {
    BeforeChangeEvent,
    CopyPlugin,
    IWallConfiguration,
    IWallDefinition,
    IWallModel,
    IWallModelConfig,
    SelectionPlugin,
    UndoRedoPlugin,
    WALL,
    WallModelFactory
} from 'ngx-wall';

@Component({
    selector: 'app-wall-editor',
    templateUrl: 'wall-editor.component.html'
})
export class WallEditorComponent implements OnInit {
    plan: IWallDefinition;

    wallConfiguration: IWallConfiguration = {
        mode: WALL.MODES.EDIT
    };

    wallPlan: IWallDefinition = {
        'bricks': [
            {
                'id': '82600916-c474-c669-7a0a-a362fb134a69',
                'tag': 'text',
                'meta': {},
                'data': {}
            }
        ],
        'layout': {
            'bricks': [
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '82600916-c474-c669-7a0a-a362fb134a69'
                                }
                            ]
                        }
                    ],
                    'id': '78602cb8-f52d-afb7-c9a8-522cfe9be303'
                },
                {
                    'columns': [
                        {
                            'bricks': []
                        }
                    ],
                    'id': '5b2daedf-d03f-d3f7-9ce9-6e2c47725db3'
                }
            ]
        }
    };

    wallModel: IWallModel;

    constructor(private wallModelFactory: WallModelFactory,
                private injector: Injector) {
        const modelConfig: IWallModelConfig = {
            plan: this.wallPlan,
            plugins: [
                new CopyPlugin(this.injector),
                new UndoRedoPlugin(this.injector),
                new SelectionPlugin(this.injector)
            ]
        };

        this.wallModel = this.wallModelFactory.create(modelConfig);
    }

    ngOnInit() {
        setTimeout(() => {
            this.wallModel.api.core.subscribe((e) => {
                if (!(e instanceof BeforeChangeEvent)) {
                    // update current plan
                    this.plan = this.wallModel.api.core.getPlan();
                }
            });
        }, 10);
    }
}
