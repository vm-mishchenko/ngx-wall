import { Component } from '@angular/core';
import { BrickRegistry } from 'wall';

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

    constructor(private brickRegistry: BrickRegistry) {
        console.log(this.brickRegistry.getAll());
    }
}