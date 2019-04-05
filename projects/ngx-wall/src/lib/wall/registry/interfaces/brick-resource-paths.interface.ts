import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';

export type IBrickResourcePaths = (brickSnapshot: IBrickSnapshot) => string[];
