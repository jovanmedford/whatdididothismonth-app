"use client"
import { useIsMobile } from "@/app/_hooks/useIsMobile"
import { PropsWithChildren, ReactNode } from "react"
import { PopoverShell } from "./popover-shell"
import { DrawerShell } from "./drawer-shell"

export function ResponsiveShell({ children, trigger, title }: ResponsiveShellProps) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <DrawerShell title={title} trigger={trigger}>
            {children}
        </DrawerShell>
    }

    return (
        <PopoverShell title={title} trigger={trigger}>
            {children}
        </PopoverShell>
    )
}

export type ResponsiveShellProps = PropsWithChildren<{
    title: string
    trigger: ReactNode
}>