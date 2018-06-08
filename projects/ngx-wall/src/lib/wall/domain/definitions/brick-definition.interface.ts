export interface IBrickDefinition {
    id: string;
    tag: string;

    // user specific data
    data: {};

    meta: {
        comments?: any[]
    };
}

