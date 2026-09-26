import { X } from 'lucide-react';
import { Popover } from "radix-ui";
import { ResponsiveShellProps } from "./responsive-shell";
import { buttonStyles } from "../button/button";


export function PopoverShell({ trigger, children, open, onOpenChange }: ResponsiveShellProps) {
    return (
        <Popover.Root open={open} onOpenChange={onOpenChange}>
            <Popover.Trigger asChild>
                {trigger}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className="bg-popover-background w-120 pt-4 pb-6 px-8 shadow-lg border rounded border-text" align="end" sideOffset={4}>
                    <Popover.Arrow className="fill-text" />
                    <div className="w-full flex justify-end">
                        <Popover.Close className={buttonStyles("transparent", "icon")} aria-label="Close"><X className="size-4.5" /></Popover.Close>
                    </div>
                    {children}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}