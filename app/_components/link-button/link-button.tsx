import { PropsWithChildren } from "react"
import Link, { LinkProps } from "next/link"
import clsx from "clsx"

export function LinkButton({ children, href, variant, className, ...rest }: LinkButtonProps) {
    return (<Link href={href} className={clsx(getButtonVariantStyle(variant), "py-3 px-4 rounded-3xl block w-fit", className)} {...rest}>
        {children}
    </Link>)
}

function getButtonVariantStyle(variant?: LinkButtonVariant): string {
    switch (variant) {
        case "primary":
            return "bg-primary-400 text-background"
        default:
            return "text-primary-400"
    }
}

type LinkButtonProps = PropsWithChildren<LinkProps> & {
    className?: string
    variant?: LinkButtonVariant
}

type LinkButtonVariant = "primary"