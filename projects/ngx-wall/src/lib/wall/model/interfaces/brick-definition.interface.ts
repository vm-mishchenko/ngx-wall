export interface IBrickDefinition {
    id: string;
    tag: string;

    // user specific data
    // todo: make more strict type
    data: any;

    meta: {
        comments?: any[]
    };
}
