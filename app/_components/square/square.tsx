"use client";

import { clsx } from "@/lib/util";

/**
 * 
 * WDIDTM Activity Square
 */
export default function Square({ className, isChecked = false, onChange = () => console.log("CLICKED"), disabled = false }: SquareProps) {
    return (
        <label className={`block cursor-pointer focus:outline-2 checkbox-parent size-7 
                           ${clsx(className, 
                                  isChecked ? "bg-primary-400" : "bg-muted",
                                  isChecked ? "hover:bg-primary-400/80" : "hover:bg-muted/80",)}`}>
            <input className="sr-only" type="checkbox" checked={isChecked} onChange={onChange} readOnly={!!onChange} disabled={disabled} />
        </label>
    )
}

interface SquareProps {
    disabled?: boolean
    className?: string
    isChecked?: boolean
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}