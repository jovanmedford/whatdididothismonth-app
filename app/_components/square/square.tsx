"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import "./square.css";

export default function Square({
    className,
    isChecked = false,
    isReached = false,
    onChange = () => console.log("CLICKED"),
    disabled = false,
}: SquareProps) {
    const prevReached = useRef(isReached);
    const [isBooping, setIsBooping] = useState(false);

    useEffect(() => {
        if (!prevReached.current && isReached && isChecked) {
            setIsBooping(true);
        }

        prevReached.current = isReached;
    }, [isReached, isChecked]);

    return (
        <label
            className={clsx(
                "background-transition block cursor-pointer focus:outline-2 checkbox-parent size-7",
                getBackgroundColor(isChecked, isReached),
                className,
                isBooping && "boop-animation"
            )}
            onAnimationEnd={() => setIsBooping(false)}
        >
            <input
                className="sr-only"
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                readOnly={!!onChange}
                disabled={disabled}
            />
        </label>
    );
}

function getBackgroundColor(isChecked: boolean, isReached?: boolean) {
    if (isReached && isChecked) {
        return "bg-reached hover:bg-reached/80";
    }

    if (isChecked) {
        return "bg-primary-400 hover:bg-primary-400/80";
    }

    return "bg-muted hover:bg-muted/80";
}

interface SquareProps {
    disabled?: boolean;
    className?: string;
    isChecked?: boolean;
    isReached?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}