import {ResourceLoader} from "./resources.ts";
import {not_null} from "../utils.tsx";
import {vi} from "vitest";

type ResolveRejectPair<T> = {
    future?: Promise<T>;
    resolve: (value: (T | PromiseLike<T>)) => void;
    reject: (reason?: unknown) => void;
}

describe('resource loading', () => {
    const FIRST_URL = "https://example.com/some/file";
    const SECOND_URL = "https://example.com/another/file";
    const THIRD_URL = "https://example.com/hello.txt";

    class MockTestLoader extends ResourceLoader<number> {
        constructor(public requestFunc: (url: string) => Promise<number>) {
            super();
            this.onStartRequest = vi.fn().mockImplementation((_name, _url, _pending) => {
            });
        }

        override onRequestResource(url: string): Promise<number> {
            return this.requestFunc(url);
        }
    }

    class TestLoaderWithControllableFutures extends ResourceLoader<number> {
        private resolveRejectPairs: Map<string, ResolveRejectPair<number>> = new Map<string, ResolveRejectPair<number>>();
        private futures: Map<string, Promise<number>> = new Map<string, Promise<number>>();

        constructor() {
            super();
            this.onStartRequest = vi.fn().mockImplementation((_name, _url, _pending) => {
                }
            );
        }

        async completeRequest(url: string, value?: number): Promise<number> {
            expect(this.resolveRejectPairs.has(url)).toBe(true);
            expect(this.futures.has(url)).toBe(true);

            not_null(this.resolveRejectPairs.get(url)).resolve(value ?? 0);

            const future = not_null(this.futures.get(url));

            this.resolveRejectPairs.delete(url);
            this.futures.delete(url);

            return await future;
        }


        async failRequest(url: string): Promise<void> {
            expect(this.resolveRejectPairs.has(url)).toBe(true);
            expect(this.futures.has(url)).toBe(true);

            not_null(this.resolveRejectPairs.get(url)).reject("test error message");

            const future = not_null(this.futures.get(url));

            this.resolveRejectPairs.delete(url);
            this.futures.delete(url);

            await future;
        }

        override onRequestResource(url: string): Promise<number> {
            const promise = new Promise<number>((resolve, reject) => {
                this.resolveRejectPairs.set(url, {resolve: resolve, reject: reject});
            });

            this.futures.set(url, promise);
            return promise;
        }
    }

    it('should return the number of pending load requests', async () => {
        const loader = new TestLoaderWithControllableFutures();
        expect(loader.requestsPendingCount()).toBe(0);

        // Request multiple resources with separate URLs.
        const firstRequest = loader.load("first", FIRST_URL);
        expect(loader.requestsPendingCount()).toBe(1);

        const secondRequest = loader.load("second", SECOND_URL);
        expect(loader.requestsPendingCount()).toBe(2);

        const thirdRequest = loader.load("third", THIRD_URL);
        expect(loader.requestsPendingCount()).toBe(3);

        // Finish requests out of order, and one at a time. Observe that the request count
        // decreases.
        expect(await loader.completeRequest(FIRST_URL, 50)).toBe(50);
        expect(loader.requestsPendingCount()).toBe(2);

        expect(await loader.completeRequest(THIRD_URL, 100)).toBe(100);
        expect(loader.requestsPendingCount()).toBe(1);

        expect(await loader.completeRequest(SECOND_URL, 73)).toBe(73);
        expect(loader.requestsPendingCount()).toBe(0);

        // await the above returned requests to keep the linter happy.
        await firstRequest;
        await secondRequest;
        await thirdRequest;
    });

    it('load should return the loaded resource when the promise completes', async () => {
        const loader = new MockTestLoader(vi.fn().mockResolvedValue(42));
        expect(await loader.load("first", FIRST_URL)).toBe(42);
    });

    it('load should return undefined when the promise fails', async () => {
        const loader = new MockTestLoader(vi.fn().mockRejectedValue(1000));
        loader.onRequestError = vi.fn().mockImplementation(() => {
        });

        expect(await loader.load("first", FIRST_URL)).toBe(undefined);
    });

    it('requestLoad calls onLoadedCallback when load ok', async () => {
        const loader = new TestLoaderWithControllableFutures();
        const callback = vi.fn().mockImplementation((_resource) => {
        });

        loader.requestLoad("first", FIRST_URL, callback);
        expect(callback).not.toHaveBeenCalled();

        expect(await loader.completeRequest(FIRST_URL, 22)).toBe(22);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(22);
    });

    it('requestLoad does not call onLoadedCallback when load has error', async () => {
        const loader = new TestLoaderWithControllableFutures();
        loader.onRequestError = vi.fn().mockImplementation(() => {
        });

        const callback = vi.fn().mockImplementation((_resource) => {
        });

        loader.requestLoad("first", FIRST_URL, callback);


        expect(async () => await expect(loader.failRequest(FIRST_URL)).rejects.toThrow());
        expect(callback).not.toHaveBeenCalled();
    });
});