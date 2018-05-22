export class Base64ToFile {
    constructor(private base64: string, private fileName: string) {
    }

    getFile(): File {
        const arr = this.base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], this.fileName, {type: mime});
    }
}
