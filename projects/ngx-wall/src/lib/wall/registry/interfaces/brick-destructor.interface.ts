import {IBrickSnapshot} from '../..';

export type IBrickDestructor = (brickSnapshot: IBrickSnapshot) => Promise<any>;
