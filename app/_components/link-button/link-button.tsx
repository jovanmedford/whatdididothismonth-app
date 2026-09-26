import { PropsWithChildren } from "react"
import Link, { LinkProps } from "next/link"
import { cn } from "@/lib/utils"
import { buttonStyles } from "../button/button"

export function LinkButton({ children, href, variant, className, ...rest }: LinkButtonProps) {
    return (<Link href={href} className={cn(buttonStyles(variant), "w-fit", className)} {...rest}>
        {children}
    </Link>)
}

type LinkButtonProps = PropsWithChildren<LinkProps> & {
    className?: string
    variant?: LinkButtonVariant
}

type LinkButtonVariant = "primary"