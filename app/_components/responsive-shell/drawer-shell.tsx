import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ResponsiveShellProps } from "./responsive-shell"
import { X } from "lucide-react"

export function DrawerShell({ trigger, children, title }: ResponsiveShellProps) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="flex">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerClose>
                        <X />
                    </DrawerClose>
                </DrawerHeader>

                {children}
            </DrawerContent>
        </Drawer>
    )
}