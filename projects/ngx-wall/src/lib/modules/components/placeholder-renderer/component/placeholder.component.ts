import {Component} from '@angular/core';

@Component({
    templateUrl: './placeholder.component.html',
    styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent {
    x: number;
    y: number;
    size: number;
    isHorizontal: boolean;

    setCoordinate(x: number, y: number, size: number, isHorizontal: boolean) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isHorizontal = isHorizontal;
    }
}
