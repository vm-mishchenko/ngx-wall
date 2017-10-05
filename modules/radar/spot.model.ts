import { SpotDirective } from "./directive/radar.directive";

export class SpotModel {
    instance: SpotDirective;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(instance: SpotDirective) {
        this.instance = instance;
    }

    updatePosition() {
        const spotPosition = this.instance.getPosition();

        this.x = spotPosition.x;
        this.y = spotPosition.y;
        this.width = spotPosition.width;
        this.height = spotPosition.height;
    }

    getMinimalDistanceToPoint(x: number, y: number) {
        let minimalDistance = null;

        // distances to horizontal lines
        const distanceToLine12 = Math.abs(this.y - y);
        const distanceToLine43 = Math.abs((this.y + this.height) - y);

        // distances to vertical lines
        const distanceToLine14 = Math.abs(this.x - x);
        const distanceToLine23 = Math.abs((this.x + this.width) - x);

        const minDistanceToHorizontalLine = Math.min.apply(null, [distanceToLine12, distanceToLine43]);
        const minDistanceToVerticalLine = Math.min.apply(null, [distanceToLine14, distanceToLine23]);

        if ((x > this.x) && (x < this.x + this.width)) {
            // point directly cross the beacon
            minimalDistance = minDistanceToHorizontalLine;
        } else if ((y > this.y) && (y < this.y + this.height)) {
            // point directly cross the beacon
            minimalDistance = minDistanceToVerticalLine;
        } else {
            // point doesn't cross beacon, calculate shortest distance to beacon
            minimalDistance = Math.sqrt(minDistanceToHorizontalLine * minDistanceToHorizontalLine + minDistanceToVerticalLine * minDistanceToVerticalLine);
        }

        return minimalDistance;
    }
}