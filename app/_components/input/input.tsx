import { ComponentProps } from "react";

export function Input({ label, className, ...rest }: InputProps) {
    return (
        <div>
            {label && (
                <label className="block" htmlFor={rest.id}>
                    {label}
                </label>
            )}
            <input id={rest.id} className={`w-full border p-1 ${className || ''}`} {...rest} />
        </div>
    );
}

type InputProps = ComponentProps<"input"> & {
    label?: string
}