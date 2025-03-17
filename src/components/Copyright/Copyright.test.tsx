import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Copyright from './Copyright';

test('renders an author and the specified copyright date', () => {
    render(<Copyright year={1999} name="Super Duper Person"/>);
    const textElement = screen.getByText("Copyright © 1999 Super Duper Person");
    expect(textElement).toBeInTheDocument();
});

test('renders the current year when not given a year', () => {
    const year = new Date().getFullYear();

    render(<Copyright name="Bob Anderson"/>);
    const textElement = screen.getByText("Copyright © " + year + " Bob Anderson");
    expect(textElement).toBeInTheDocument();
});