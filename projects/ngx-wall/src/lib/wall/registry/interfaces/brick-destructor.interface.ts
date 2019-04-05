import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';

export type IBrickDestructor = (brickSnapshot: IBrickSnapshot) => Promise<any>;
