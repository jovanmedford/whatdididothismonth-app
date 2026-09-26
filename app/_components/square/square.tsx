"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./square.css";

export default function Square({
    className,
    isChecked = false,
    isReached = false,
    onChange,
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
            className={cn(
                "square-transition relative flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-md border text-sm font-medium tabular-nums",
                "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-400",
                getStateClasses(isChecked, isReached),
                className,
                isBooping && "square-boop",
                disabled && "cursor-not-allowed opacity-50"
            )}
            onAnimationEnd={() => setIsBooping(false)}
        >
            <input
                className="sr-only"
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                disabled={disabled}
                aria-label={`Day ${day}`}
            />
            <span aria-hidden="true">{day}</span>
        </label>
    );
}

function getStateClasses(isChecked: boolean, isReached: boolean) {
    if (isReached && isChecked) {
        return "border-reached bg-reached text-white has-[:enabled]:hover:bg-reached/90";
    }

    if (isChecked) {
        return "border-primary-400 bg-primary-400 text-white has-[:enabled]:hover:bg-primary-400/90";
    }

    return "border-border bg-muted/70 text-primary-400 has-[:enabled]:hover:border-primary-100 has-[:enabled]:hover:bg-highlight";
}

interface SquareProps {
    disabled?: boolean;
    className?: string;
    isChecked?: boolean;
    isReached?: boolean;
    day: number
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
