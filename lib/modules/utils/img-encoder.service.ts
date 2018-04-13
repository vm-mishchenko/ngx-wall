export class ImgEncoder {
    constructor(private image: File) {
    }

    getBase64Representation(): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event: any) => {
                resolve(event.target.result);
            };

            reader.onerror = (event: any) => {
                reject(event);
            };

            reader.readAsDataURL(this.image);
        });
    }
}
