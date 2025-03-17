interface CopyrightProps {
    year?: number;
    name: string;
}

export default function Copyright({year, name}: CopyrightProps) {
    return (<div role="contentinfo">
        Copyright &copy; {year ?? new Date().getFullYear()} {name}
    </div>)
}