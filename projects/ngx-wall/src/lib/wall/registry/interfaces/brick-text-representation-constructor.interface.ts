import {IBrickSnapshot} from '../..';
import {IBrickTextRepresentation} from './brick-text-representation.interface';

export interface IBrickTextRepresentationConstructor {
    new(brickSnapshot: IBrickSnapshot): IBrickTextRepresentation;
}
