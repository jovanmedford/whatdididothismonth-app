import { ComponentProps } from "react";

export const Button = ({ className, children, ...rest }: ButtonProps) => {
    return (
        <button className={`border px-4 py-1 rounded hover:cursor-pointer ${className || ''}`} {...rest} >
            {children}
        </button>
    );
}

type ButtonProps = ComponentProps<"button">