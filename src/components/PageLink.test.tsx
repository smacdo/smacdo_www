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

    /* TODO - this doesn't seem to fire the event correctly. Need to investigate.

    it('should prevent default navigation behavior, update history and notify event listeners of a url change', () => {
        window.history.replaceState = vi.fn();

        render(<PageLink path={testPath}>{testChildren}</PageLink>);
        const linkElement = screen.getByText(testChildren);
        expect(linkElement).toBeInTheDocument();

        // Simulate a click event on the link without any modifier keys.
        const mockClickEvent = {
            preventDefault: vi.fn(), // mock this to check that it is called.
            ctrlKey: false,
            metaKey: false,
            shiftKey: false
        } as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>;

        fireEvent.click(linkElement, mockClickEvent);

        // Verify that preventDefault was called, which stops the browser's default behavior of
        // reloading the page.
        expect(mockClickEvent.preventDefault).toHaveBeenCalledTimes(1);

        // Check that the requested link was added to the browser window's history via pushState.
        expect(window.history.replaceState).toHaveBeenCalledTimes(0);
        expect(window.history.pushState).toHaveBeenCalledTimes(1);
        expect(window.history.pushState).toHaveBeenCalledWith({}, '', testPath);

        // Verify any active event listeners have been notified that the URL changed.
        expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
        expect(window.dispatchEvent).toHaveBeenCalledWith(new PopStateEvent('popstate'));
    });
     */
});