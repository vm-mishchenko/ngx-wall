import {SpotDirective} from './directive/spot.directive';
import {ISpotPosition, ISpotSize} from './interfaces/distance-to-spot.interface';
import {SpotId} from './interfaces/spot-id.type';

export class SpotModel {
    id: SpotId;
    data: any;
    position: ISpotPosition;
    size: ISpotSize;

    private instance: SpotDirective;

    constructor(instance: SpotDirective) {
        this.id = instance.id;
        this.instance = instance;

        this.updateInfo();
    }

    updateInfo() {
        const {position, size, data} = this.instance.getInfo();

        this.data = data;
        this.size = size;
        this.position = position;
    }

    isCross13Line(y) {
        return (y > this.position.y) && (y < this.position.y + this.size.height);
    }

    getMinimalDistanceToPoint(x: number, y: number) {
        let minimalDistance = null;

        // distances to horizontal lines
        const distanceToLine12 = Math.abs(this.position.y - y);
        const distanceToLine43 = Math.abs((this.position.y + this.size.height) - y);

        // distances to vertical lines
        const distanceToLine14 = Math.abs(this.position.x - x);
        const distanceToLine23 = Math.abs((this.position.x + this.size.width) - x);

        const minDistanceToHorizontalLine = Math.min.apply(null, [distanceToLine12, distanceToLine43]);
        const minDistanceToVerticalLine = Math.min.apply(null, [distanceToLine14, distanceToLine23]);

        if ((x > this.position.x) && (x < this.position.x + this.size.width)) {
            // point directly cross the beacon
            minimalDistance = minDistanceToHorizontalLine;
        } else if ((y > this.position.y) && (y < this.position.y + this.size.height)) {
            // point directly cross the beacon
            minimalDistance = minDistanceToVerticalLine;
        } else {
            // point doesn't cross beacon, calculate shortest distance to beacon
            minimalDistance = Math.sqrt(
                minDistanceToHorizontalLine *
                minDistanceToHorizontalLine +
                minDistanceToVerticalLine *
                minDistanceToVerticalLine
            );
        }

        return minimalDistance;
    }

    getDistanceToTopLeftPoint(x: number, y: number) {
        const a = Math.abs(this.position.x - x);
        const b = Math.abs(this.position.y - y);

        return Math.sqrt(a * a + b * b);
    }

    getDistanceToBottomLeftPoint(x: number, y: number) {
        const a = Math.abs(this.position.x - x);
        const b = Math.abs(this.position.y + this.size.height - y);

        return Math.sqrt(a * a + b * b);
    }

    getDistanceToLeftCenterPoint(x: number, y: number) {
        const a = Math.abs(this.position.x - x);
        const b = Math.abs(this.position.y + (this.size.height / 2) - y);

        return Math.sqrt(a * a + b * b);
    }

    isPointInsideSpot(x: number, y: number): boolean {
        if ((x > this.position.x) && (x < this.position.x + this.size.width) &&
            (y > this.position.y) && (y < this.position.y + this.size.height)) {
            return true;
        } else {
            return false;
        }
    }
}
