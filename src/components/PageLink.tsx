import * as React from "react";

interface PageLinkProps {
    path: string;
    children: React.ReactNode;
}

/**
 * Displays a link to another page in the website.
 */
export default function PageLink({path, children}: PageLinkProps) {
    return (
        <a href={path} onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            // Use the default behavior of opening a link in a new window when the appropriate
            // keyboard button is pressed.
            if (event.ctrlKey || event.metaKey || event.shiftKey) {
                return;
            }

            // Stop the default behavior of browsing following the link and reloading the page.
            event.preventDefault();

            // Manually change the current page's URL to the masthead path.
            window.history.pushState({}, "", path);

            // Communicate to any active event listeners that the URL has changed.
            window.dispatchEvent(new PopStateEvent('popstate'));
        }}>{children}</a>
    )
}