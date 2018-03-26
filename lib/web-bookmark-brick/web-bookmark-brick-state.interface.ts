export interface IWebBookmarkBrickState {
    src: string;
    description: string;
    title: string;
    author: string;
    image: {
        height: number;
        width: number;
        url: string;
    };
    logo: {
        height: number;
        width: number;
        url: string;
    };
}
