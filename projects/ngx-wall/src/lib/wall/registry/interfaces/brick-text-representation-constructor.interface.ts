import {IBrickSnapshot} from '../..';
import {IBrickTextRepresentation} from './brick-text-representation.interface';

// todo: replace it just to function call
export interface IBrickTextRepresentationConstructor {
    new(brickSnapshot: IBrickSnapshot): IBrickTextRepresentation;
}
