import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';

@Injectable()
export class WallModel {
    constructor(private api: WallApi) {
        this.api.init(this);
    }
}
