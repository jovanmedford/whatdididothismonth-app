import { ComponentProps } from "react";

export function Input({ label, className, ...rest }: InputProps) {
    return (
        <div>
            <label className="block" htmlFor={rest.id}>
                {label}
            </label>
            <input className={`w-full border p-1 ${className || ''}`} {...rest} />
        </div>
    );
}

type InputProps = ComponentProps<"input"> & {
    label: string
}