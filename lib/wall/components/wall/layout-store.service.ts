import { Injectable } from '@angular/core';
import { ILayoutDefinition } from '../../wall.interfaces';
import { BrickRegistry } from '../../registry/brick-registry.service';
import { BrickStore } from './brick-store.service';

@Injectable()
export class LayoutStore {
    constructor(private brickRegistry: BrickRegistry, private brickStore: BrickStore) {

    }

    layout: ILayoutDefinition = null;

    initialize(layout: ILayoutDefinition) {
        this.layout = layout;
    }

    getCanvasLayout() {
        return {
            bricks: this.layout.bricks.map((row) => {
                return {
                    columns: row.columns.map((column) => {
                        return {
                            bricks: column.bricks.map((brick) => {
                                const brickTag = this.brickStore.getBrickTagById(brick.id);

                                return {
                                    id: brick.id,
                                    component: this.brickRegistry.get(brickTag).component
                                };
                            })
                        }
                    })
                }
            })
        };
    }

    serialize() {
        return this.layout;
    }

    addBrick(brickId: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        const brickTag = this.brickStore.getBrickTagById(brickId);

        const brick = {
            id: brickId,
            component: this.brickRegistry.get(brickTag).component
        };

        this.layout.bricks[targetRowIndex].columns[targetColumnIndex].bricks.splice(positionIndex, 0, brick);
    }

    // super naive implementation
    removeBrick(brickId: string) {
        this.layout.bricks.forEach((row) => {
            row.columns.forEach((column) => {
                let brickIndex = null;

                column.bricks.forEach((brick, index) => {
                    if (brick.id === brickId) {
                        brickIndex = index;
                    }
                });

                if (brickIndex || brickIndex === 0) {
                    column.bricks.splice(brickIndex, 1);
                }
            })
        })
    }
}