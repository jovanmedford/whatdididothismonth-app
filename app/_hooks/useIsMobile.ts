import { useEffect, useState } from "react";

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");


        setIsMobile(mql.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handleChange);
        return () => mql.removeEventListener("change", handleChange);
    }, []);

    return isMobile;
}