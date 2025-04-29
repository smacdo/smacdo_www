import {not_null} from "../utils.tsx";

export abstract class ResourceLoader<T> {
    resources = new Map<string, T>();
    onRequestError?: (reason: unknown) => void;
    onStartRequest?: (name: string, url: string, requestPendingCount: number) => void;

    protected _requestsPendingCount = 0;
    protected _requestErrorsCount = 0;

    private cache = new Map<string, T>();

    requestsPendingCount(): number {
        return this._requestsPendingCount;
    }

    errorCount(): number {
        return this._requestErrorsCount;
    }

    isLoaded(name: string): boolean {
        return this.resources.has(name);
    }

    find(name: string): T | undefined {
        return this.resources.get(name);
    }

    get(name: string): T {
        const resource = this.resources.get(name);

        if (resource === undefined) {
            throw Error(`resource ${name} not loaded`);
        }

        return resource;
    }

    set(name: string, value: T) {
        this.resources.set(name, value);
    }

    unload(name: string) {
        if (this.resources.has(name)) {
            this.resources.delete(name);
        } else {
            console.warn(`could not find resource when unloading ${name}`);
        }
    }

    requestLoad(name: string, url: string, onLoadedCallback?: (resource: T) => void) {
        this.load(name, url).then((resource) => {
            if (resource !== undefined && onLoadedCallback) {
                onLoadedCallback(not_null(resource));
            }
        });
    }

    async load(name: string, url: string): Promise<T | undefined> {
        if (this.resources.has(name)) {
            return this.resources.get(name);
        }

        if (this.cache.has(name)) {
            const cached = not_null(this.cache.get(name));
            this.resources.set(name, not_null(cached));
            return cached;
        }

        try {
            if (this.onStartRequest === undefined) {
                console.debug(`awaiting resource ${name} from ${url} (${this.requestsPendingCount()} requests pending)`);
            } else {
                this.onStartRequest(name, url, this.requestsPendingCount());
            }

            this._requestsPendingCount += 1;
            const resource = await this.onRequestResource(url);

            this.resources.set(name, resource);
            return resource;
        } catch (reason) {
            this._requestErrorsCount += 1;

            if (this.onRequestError === undefined) {
                console.error(reason);
            } else {
                this.onRequestError(reason);
            }

            return undefined;
        } finally {
            this._requestsPendingCount -= 1;
        }
    }

    abstract onRequestResource(url: string): Promise<T>;
}

export class ImageLoader extends ResourceLoader<HTMLImageElement> {
    override onRequestResource(url: string): Promise<HTMLImageElement> {
        return httpGetImage(url);
    }
}

export async function httpGetImage(url: string): Promise<HTMLImageElement> {
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
                reject(`failed to load image resource from ${url} [HTTP status ${xhr.status}]`);
            }
        };

        xhr.onerror = () => reject(`network error while loading ${url}`);
        xhr.send();
    });
}

export async function httpGetData<T>(url: string, responseType: XMLHttpRequestResponseType): Promise<T> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = responseType;

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(`failed to load ${responseType} resource from ${url} [HTTP status ${xhr.status}]`);
            }
        };

        xhr.onerror = () => reject(`network error while loading ${url}`);
        xhr.send();
    });
}