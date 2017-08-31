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

        let row = this.layout.bricks[targetRowIndex];
        let column = row.columns[targetColumnIndex];

        if (!column) {
            positionIndex = 0;

            const siblingColumn = row.columns[targetColumnIndex - 1];

            if (siblingColumn.bricks.length === 0) {
                column = siblingColumn;
            } else {
                column = row.columns[row.columns.length] = {
                    bricks: []
                };
            }
        }

        column.bricks.splice(positionIndex, 0, brick);
    }

    removeBrick(brickId: string) {
        const brickPosition = this.getBrickPositionByBrickId(brickId);

        const row = this.layout.bricks[brickPosition.rowIndex];
        const column = row.columns[brickPosition.columnIndex];

        // remove brick
        column.bricks.splice(brickPosition.brickIndex, 1);

        // remove column if there are no bricks inside
        if (column.bricks.length === 0) {
            row.columns.splice(brickPosition.columnIndex, 1);

            // remove row if there are no columns inside
            if (row.columns.length === 0) {
                this.layout.bricks.splice(brickPosition.brickIndex, 1);

                // if there are no rows, create default
                this.layout.bricks.push({
                    columns: [{
                        bricks: []
                    }]
                });
            }
        }
    }

    private getBrickPositionByBrickId(brickId: string) {
        const brickPosition = {
            rowIndex: null,
            columnIndex: null,
            brickIndex: null
        };

        let i = 0;

        while (brickPosition.rowIndex === null && i < this.layout.bricks.length) {
            this.layout.bricks[i].columns.forEach((column, columnIndex) => {
                let brickIndex = null;

                column.bricks.forEach((brick, index) => {
                    if (brick.id === brickId) {
                        brickIndex = index;
                    }
                });

                if (brickIndex || brickIndex === 0) {
                    brickPosition.rowIndex = i;
                    brickPosition.columnIndex = columnIndex;
                    brickPosition.brickIndex = brickIndex;
                }
            });

            i++;
        }

        return brickPosition;
    }
}