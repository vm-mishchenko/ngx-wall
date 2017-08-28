import { Injectable } from '@angular/core';
import { WallModel } from './wall.model';

@Injectable()
export class WallApi {
    wallModel: WallModel = null;

    init(wallModel: WallModel) {
        this.wallModel = wallModel;
    }

    registerEvent(featureName: string, eventName: string) {
    }

    registerMethod(featureName: string, methodName: string, callBackFn: Function) {
    }

    // protected API
    addBrick() {
        console.log('addBrick');
    }

    moveBrick() {
        console.log('moveBrick');
    }

    removeBrick() {
        console.log('removeBrick');
    }
}