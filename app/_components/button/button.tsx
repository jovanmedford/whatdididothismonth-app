import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export const Button = ({ variant, size, className, children, ...rest }: ButtonProps) => {
    return (
        <button className={buttonStyles(variant, size, className)} {...rest}>
            {children}
        </button>
    );
}

export function buttonStyles(variant?: ButtonVariant, size: ButtonSize = "default", className?: string) {
    return cn(
        "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-base font-medium leading-none transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 disabled:cursor-not-allowed disabled:opacity-50",
        size === "icon" ? "w-10 p-0" : "px-4",
        getVariantClasses(variant),
        className
    )
}

function getVariantClasses(variant?: ButtonVariant) {
    switch (variant) {
        case "primary":
            return "border-primary-400 bg-primary-400 text-white hover:border-primary-400/90 hover:bg-primary-400/90";
        case "secondary":
            return "border-secondary-400 bg-secondary-400/40 text-primary-400 hover:bg-secondary-400/65";
        case "transparent":
            return "border-transparent bg-transparent text-text-light hover:bg-highlight hover:text-text";
        case "danger":
            return "border-error bg-error text-white hover:bg-error/90";
        default:
            return "border-border bg-background text-text hover:border-text-light/50 hover:bg-highlight";
    }
}

type ButtonProps = ComponentProps<"button"> & {
    variant?: ButtonVariant
    size?: ButtonSize
}

type ButtonSize = "default" | "icon"

type ButtonVariant = "primary" | "secondary" | "transparent" | "danger"