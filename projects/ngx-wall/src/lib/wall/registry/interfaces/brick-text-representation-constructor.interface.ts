import {IBrickTextRepresentation} from './brick-text-representation.interface';
import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';

// todo: replace it just to function call
export interface IBrickTextRepresentationConstructor {
    new(brickSnapshot: IBrickSnapshot): IBrickTextRepresentation;
}
