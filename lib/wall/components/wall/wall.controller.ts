import { Injectable } from '@angular/core';

@Injectable()
export class WallController {
    onEditorClick(e: Event) {
        console.log(e.target);
    }
}