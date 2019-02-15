export interface IWallFileUploaderResult {
    path: string;
    downloadURL: string;
}

export interface IWallFileUploader {
    upload(brickId: string, file): Promise<IWallFileUploaderResult>;

    remove(publicUrl: string): Promise<any>;

    canUploadFile(): boolean;
}
