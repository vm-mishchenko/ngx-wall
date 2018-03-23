import { Component } from '@angular/core';

@Component({
    templateUrl: './placeholder.component.html'
})
export class PlaceholderComponent {
    private x: number;
    private y: number;
    private size: number;
    private isHorizontal: boolean;

    setCoordinate(x: number, y: number, size: number, isHorizontal: boolean) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isHorizontal = isHorizontal;
    }
}
