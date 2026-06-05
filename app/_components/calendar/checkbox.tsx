"use client";
import clsx from "clsx";
import { Check } from 'lucide-react';

export function CheckBox({ isChecked = false, onChange, label, className }: { isChecked?: boolean; onChange?: () => void; label: string; className?: string }) {
    return (
        <label className={clsx("block cursor-pointer focus-within:outline-2 relative p-2 checkbox-parent size-4 border border-text rounded", isChecked ? "bg-text border-primary-400" : "hover:bg-highlight", className)}>
            <p className="sr-only">{label}</p>
            <input
                className="sr-only"
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
            />
            {isChecked && <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white size-4" />}
        </label>
    )
}