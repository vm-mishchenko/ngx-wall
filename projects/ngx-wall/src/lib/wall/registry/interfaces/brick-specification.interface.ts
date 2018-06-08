import {IBrickDestructor} from './brick-destructor.interface';
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
}
