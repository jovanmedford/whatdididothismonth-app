"use client";

/**
 * 
 * WDIDTM Activity Square
 */
export default function Square({ isChecked = false, onChange = () => console.log("CLICKED") }: SquareProps) {
    return (
        <label className={`${isChecked ? "bg-primary-400" : "bg-gray-300"} block w-7 h-7 lg:w-8 lg:h-8 rounded-sm focus:outline-2 checkbox-parent`}>
            <input className="sr-only" type="checkbox" checked={isChecked} onChange={onChange} readOnly={!!onChange}/>
        </label>
    )
}

interface SquareProps {
    isChecked?: boolean
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}