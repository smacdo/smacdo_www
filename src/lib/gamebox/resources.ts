export class ImageLoader {
    resources = new Map<string, HTMLImageElement>();
    private _requestsPendingCount = 0;
    private _requestErrorsCount = 0;

    requestsPendingCount(): number {
        return this._requestsPendingCount;
    }

    errorCount(): number {
        return this._requestErrorsCount;
    }

    load(name: string, url: string, onLoadedCallback?: (image: HTMLImageElement) => void): Promise<HTMLImageElement | void> {
        this._requestsPendingCount += 1;

        return loadImageResource(url).then((image) => {
            console.log(`loaded image ${name} from ${url}`);
            this._requestsPendingCount -= 1;

            this.resources.set(name, image);
            return image;
        }).then((image) => {
            if (onLoadedCallback) {
                onLoadedCallback(image);
            }

            return image;
        }).catch((reason) => {
            console.error(reason);
            this._requestErrorsCount += 1;
        }).finally(() => this._requestsPendingCount--);
    }
}

export async function loadImageResource(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const asset = new Image();
                asset.src = URL.createObjectURL(xhr.response);
                asset.onload = () => resolve(asset);
                asset.onerror = () => reject(`failed to load image from ${url}`);
                resolve(asset);
            } else {
                reject(`failed to load image asset from ${url} [status ${xhr.status}]`);
            }
        };

        xhr.onerror = () => reject(`network error while loading ${url}`);
        xhr.send();
    });
}

/*
export async function loadAsset(url: string, type: ResourceType): Promise<> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = type === ResourceType.Image ? 'blob' : 'text';

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (type === ResourceType.Image) {
                    const asset = new Image();
                    asset.src = URL.createObjectURL(xhr.response);
                    asset.onload = () => resolve(asset);
                    asset.onerror = () => reject(`Failed to load image from ${url}`);
                    resolve(asset);
                } else {
                    const asset = xhr.response;
                    resolve(asset);
                }
            } else {
                reject(`failed to load asset from ${url} [status ${xhr.status}]`);
            }
        };

        xhr.onerror = () => reject(`network error while loading ${url}`);
        xhr.send();
    });
}
 */