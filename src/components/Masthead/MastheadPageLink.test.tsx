import {render, screen} from '@testing-library/react';
import {expect, test, vi} from 'vitest'
import '@testing-library/jest-dom';

import MastheadPageLink from './MastheadPageLink';

const originalWindowLocation = window.location;

beforeEach(() => {
    window.location = originalWindowLocation;
});

test('renders a link when the current location does not match the path', () => {
    vi.stubGlobal('location', {pathname: "/"});

    render(<MastheadPageLink name="Hello World" path="/hello_world"/>);
    const element = screen.getByRole('link');

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('href', '/hello_world');
});

test('does not render a link when the current location matches the path', () => {
    vi.stubGlobal('location', {pathname: "/hello_world"});

    render(<MastheadPageLink name="Hello World" path="/hello_world"/>);
    const element = screen.getByText("Hello World");

    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('href');
});
