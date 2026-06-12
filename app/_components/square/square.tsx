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
    day
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
                isBooping && "boop-animation",
                disabled && "opacity-30"
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
            <span className={clsx("flex items-center justify-center h-full")}>{!disabled ? day : null}</span>
        </label>
    );
}

function getBackgroundColor(isChecked: boolean, isReached?: boolean) {
    if (isReached && isChecked) {
        return "bg-reached text-white hover:bg-reached/80";
    }

    if (isChecked) {
        return "bg-primary-400 text-white/80 hover:bg-primary-400/80";
    }

    return "bg-muted text-primary-400/80 hover:bg-muted/80";
}

interface SquareProps {
    disabled?: boolean;
    className?: string;
    isChecked?: boolean;
    isReached?: boolean;
    day: number
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}