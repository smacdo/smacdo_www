/// Display a link to a route on the page masthead.
import useWindowPath from "../hooks/UseWindowPath.ts";

export default function MastheadPageLink({name, path}: { name: string, path: string }) {
    const [windowPath] = useWindowPath();

    return (
        <li>{windowPath !== path ?
            <a href={path} onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                // Use the default behavior of opening a link in a new window when the appropriate
                // keyboard button is pressed.
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    return;
                }

                // Stop default behavior of browsing following the link and reloading the page.
                event.preventDefault();

                // Manually change the current page's URL to the masthead path.
                window.history.pushState({}, "", path);

                // Communicate to any active event listeners that the URL has changed.
                window.dispatchEvent(new PopStateEvent('popstate'));
            }}>{name}</a> : <span>{name}</span>
        }</li>
    )
}