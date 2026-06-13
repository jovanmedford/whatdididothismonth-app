"use client"
import { useIsMobile } from "@/app/_hooks/useIsMobile"
import { PropsWithChildren, ReactNode } from "react"
import { PopoverShell } from "./popover-shell"
import { DrawerShell } from "./drawer-shell"

export function ResponsiveShell({ children, trigger, title, open, onOpenChange }: ResponsiveShellProps) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <DrawerShell title={title} trigger={trigger} open={open} onOpenChange={onOpenChange}>
            {children}
        </DrawerShell>
    }

    return (
        <PopoverShell title={title} trigger={trigger} open={open} onOpenChange={onOpenChange}>
            {children}
        </PopoverShell>
    )
}

export type ResponsiveShellProps = PropsWithChildren<{
    title: string
    trigger: ReactNode
    open: boolean
    onOpenChange: (isOpen: boolean) => void
}>