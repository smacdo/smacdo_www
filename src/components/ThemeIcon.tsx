import {useEffect, useState} from "react";
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";

type WatchMediaCallbackEvent = { matches: boolean | ((prevState: boolean) => boolean); };

const useIsDarkModeDetector = () => {
    const getPrefersDarkMode = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getPrefersDarkMode());

    const onColorSchemeChanged = ((e: WatchMediaCallbackEvent) => {
        setIsDarkTheme(e.matches);
    });

    useEffect(() => {
        const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMediaQuery.addEventListener("change", onColorSchemeChanged);
        return () => darkThemeMediaQuery.removeEventListener("change", onColorSchemeChanged);
    }, []);

    return isDarkTheme;
}

export function ThemeIcon() {
    const isDarkTheme = useIsDarkModeDetector();
    return isDarkTheme ? <MdOutlineDarkMode/> : <MdOutlineLightMode/>;
}