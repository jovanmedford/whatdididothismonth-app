import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ResponsiveShellProps } from "./responsive-shell"
import { X } from "lucide-react"
import { buttonStyles } from "../button/button"

export function DrawerShell({ trigger, children, title, open, onOpenChange }: ResponsiveShellProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>
            <DrawerContent className="p-4">
                <DrawerHeader className="flex flex-row align-center justify-center gap-4 px-0">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerClose className={buttonStyles("transparent", "icon")} aria-label="Close">
                        <X className="size-4.5" />
                    </DrawerClose>
                </DrawerHeader>

                {children}
            </DrawerContent>
        </Drawer>
    )
}