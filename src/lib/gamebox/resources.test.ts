import {ResourceLoader} from "./resources.ts";
import {not_null} from "../utils.tsx";

type ResolveRejectPair<T> = {
    future?: Promise<T>;
    resolve: (value: (T | PromiseLike<T>)) => void;
    reject: (reason?: unknown) => void;
}

describe('resource loading', () => {
    const FIRST_URL = "https://example.com/some/file";
    const SECOND_URL = "https://example.com/another/file";
    const THIRD_URL = "https://example.com/hello.txt";

    class TestLoader extends ResourceLoader<number> {
        private resolveRejectPairs: Map<string, ResolveRejectPair<number>> = new Map<string, ResolveRejectPair<number>>();
        private futures: Map<string, Promise<number>> = new Map<string, Promise<number>>();

        completeRequest(url: string): Promise<number> {
            expect(this.resolveRejectPairs.has(url)).toBe(true);
            expect(this.futures.has(url)).toBe(true);

            this.resolveRejectPairs.get(url)!.resolve(0);

            const future = not_null(this.futures.get(url));

            this.resolveRejectPairs.delete(url);
            this.futures.delete(url);

            return not_null(future);
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
        const loader = new TestLoader();
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
        await loader.completeRequest(FIRST_URL);
        await firstRequest;

        expect(loader.requestsPendingCount()).toBe(2);

        await loader.completeRequest(THIRD_URL);
        await thirdRequest;

        expect(loader.requestsPendingCount()).toBe(1);

        await loader.completeRequest(SECOND_URL);
        await secondRequest;

        expect(loader.requestsPendingCount()).toBe(0);
    });
});