import { Component } from '@angular/core';
import { BrickRegistry, IWallDefinition } from 'wall';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styles: [`
        .wrapper {
            display: flex;
            justify-content: space-around;
        }

        .panel {
            flex: 1;
            padding: 0 20px;
        }
    `]
})
export class AppComponent {
    wallConfiguration = {
        mode: 'readonly'
    };

    wallPlan: IWallDefinition = {
        bricks: [
            {
                id: '1',
                type: 'text',
                data: {},
                meta: {
                    comments: []
                }
            },
            {
                id: '2',
                type: 'text',
                data: {},
                meta: {
                    comments: []
                }
            }
        ]
    };

    constructor(private brickRegistry: BrickRegistry) {
    }
}