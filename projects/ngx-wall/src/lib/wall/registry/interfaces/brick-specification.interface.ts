import {IBrickDestructor} from './brick-destructor.interface';
import {IBrickResourcePaths} from './brick-resource-paths.interface';
import {IBrickTextRepresentationConstructor} from './brick-text-representation-constructor.interface';

export interface IBrickSpecification {
    tag: string;
    component: any;

    // presentation
    name: string;
    description: string;

    supportText?: boolean;

    // todo - replace to function, as destructor
    textRepresentation?: IBrickTextRepresentationConstructor;

    // todo: architecture drawback! should add model to description
    destructor?: IBrickDestructor;

    // list of paths to remotely saved files via file-uploader service
    // todo: ideally updaloder service and client should keep track of all
    // saved files for each brick to be able safely clean up brick
    getBrickResourcePaths?: IBrickResourcePaths;
}
