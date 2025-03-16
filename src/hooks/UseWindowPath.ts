import {useEffect, useState} from "react";

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
