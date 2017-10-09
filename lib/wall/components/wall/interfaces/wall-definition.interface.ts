import { BrickDefinition, LayoutDefinition } from "../wall.interfaces";

export interface WallDefinition {
    bricks: BrickDefinition[];
    layout: LayoutDefinition;
}