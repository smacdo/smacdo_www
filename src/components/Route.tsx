import * as React from "react";
import useWindowPath from "../hooks/UseWindowPath.ts";

interface RouteProps {
    children?: React.ReactNode;
    path: string,
}


/// Displays the children elements when the page's URL matches the route path, otherwise nothing is
/// rendered.
export default function Route(props: RouteProps): React.ReactNode {
    const [windowPath] = useWindowPath();

    // Render the child element when `props.path` matches the current URL, otherwise do not render
    // the element.
    return windowPath === props.path ? (
        <main role="main">
            {props.children}
        </main>
    ) : null;
}