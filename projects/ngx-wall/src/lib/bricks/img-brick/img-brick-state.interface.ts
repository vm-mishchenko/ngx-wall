export interface ImgBrickStateMetadata {
    path: string;
}

export interface ImgBrickState {
    src: string;
    width: number;
    metadata: ImgBrickStateMetadata;
}
