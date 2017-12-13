import { Component } from '@angular/core';
import { BaseTextBrickComponent } from '../../base-text-brick/base-text-brick.component';
import { WallApi } from '../../wall';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html',
    styles: [`
        p {
            min-height: 24px;
            margin: 0;
            box-sizing: content-box;
        }
    `]
})
export class TextBrickComponent extends BaseTextBrickComponent {
    constructor(wallApi: WallApi) {
        super(wallApi);
    }

    enterKeyPressed(e) {
        if (this.isTag()) {
            const newTag = this.scope.text.slice(1);

            this.wallApi.core.turnBrickInto(this.id, newTag);

            // d - divider tag
            if (newTag === 'd') {
                this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
            }
        } else {
            super.enterKeyPressed(e);
        }
    }

    private isTag() {
        return this.scope.text && this.scope.text[0] === '/' &&
            this.wallApi.core.isRegisteredBrick(this.scope.text.slice(1));
    }
}
