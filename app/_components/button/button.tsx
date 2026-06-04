import { clsx } from "@/lib/util";
import { ComponentProps } from "react";

export const Button = ({ variant, className, children, ...rest }: ButtonProps) => {
    const variantClasses = getVariantClasses(variant)

    return (
        <button className={clsx(`border px-3 py-2 rounded hover:cursor-pointer`, variantClasses, className)} {...rest} >
            {children}
        </button>
    );
}

function getVariantClasses(variant?: ButtonVariant) {
    switch (variant) {
        case "primary":
            return "bg-primary-400 text-background";
        case "secondary":
            return "bg-secondary-400  text-background";
        case "transparent":
            return "bg-transparent text-text hover:bg-highlight border-transparent";
        default:
            return "bg-gray-200 text-gray-800 hover:bg-gray-300";
    }
}

type ButtonProps = ComponentProps<"button"> & {
    className?: string
    variant?: ButtonVariant
}

type ButtonVariant = "primary" | "secondary" | "transparent"