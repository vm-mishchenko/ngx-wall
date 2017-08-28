import { Injectable } from '@angular/core';
import { IWallDefinition } from '../../wall.interfaces';
import { WallModel } from './wall.model';

@Injectable()
export class WallController {
    constructor(private wallModel: WallModel) {
    }

    initialize(plan: IWallDefinition) {

    }
}