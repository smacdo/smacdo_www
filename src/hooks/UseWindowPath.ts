import {useEffect, useState} from "react";

/**
 * Returns a hook to read and set the window path.
 * The window path is the portion of the URL following the domain name.
 */
export default function useWindowPath() {
    const [windowPath, setWindowPath] = useState(window.location.pathname);

    useEffect(() => {
        const onLocationChange = () => {
            setWindowPath(window.location.pathname);
        };

        window.addEventListener('popstate', onLocationChange);

        return () => {
            window.removeEventListener('popstate', onLocationChange);
        };
    }, []);

    return [windowPath, setWindowPath];
}