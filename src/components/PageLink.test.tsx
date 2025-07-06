import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, vi} from 'vitest';

import '@testing-library/jest-dom';

import PageLink from './PageLink';

describe('PageLink', () => {
    const testPath = '/foo/bar';
    const testChildren = 'foobarific';

    const originalPushState = window.history.pushState;
    const originalDispatchEvent = window.dispatchEvent;

    beforeEach(() => {
        // Spy on the browser api calls. Make sure the mocks are reset before each test.
        window.history.pushState = vi.fn();
        window.dispatchEvent = vi.fn();
    });

    afterAll(() => {
        // Clean up after each test is run. Not strictly needed since vitest will (probably) clean
        // up but it never hurts to practice!
        window.history.pushState = originalPushState;
        window.dispatchEvent = originalDispatchEvent;
    });

    it('renders an anchor tag with the correct href and children', () => {
        render(<PageLink path={testPath}>{testChildren}</PageLink>);
        const linkElement = screen.getByText(testChildren);

        // Assert that the page link element renders an anchor tag.
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.tagName).toBe('A');

        // Assert that the anchor's href attribute is correct.
        expect(linkElement).toHaveAttribute('href', testPath);
    });
});