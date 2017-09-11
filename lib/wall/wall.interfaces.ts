// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug2 = true;

// Register new brick
export interface IBrickSpecification {
    tag: string;
    component: any;
    supportText?: true;
}