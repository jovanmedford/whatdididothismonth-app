import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export function Container({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("mx-auto w-full max-w-[var(--breakpoint-2xl)]", className)}
            {...props}
        />
    )
}
