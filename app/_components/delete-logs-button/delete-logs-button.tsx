"use client";
import { Trash, X } from "lucide-react";
import { Button } from "../button";
import { Dialog } from "radix-ui"
import { Input } from "../input";
import { useState, SubmitEvent } from "react";
import { deleteActivityLogs } from "@/app/_data/activity-log";
import { toast } from "../toast/store";
import { useSelection } from "@/app/calendar/selection-provider";

export function DeleteLogsButton({ logs }: { logs: string[] }) {
    const { clearSelection } = useSelection();
    const [message, setMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    async function handleDelete(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const result = await deleteActivityLogs({ activityLogIds: logs });

        if (!result.ok) {
            toast.error(result.error.message || "Failed to delete logs");
            return
        }

        if (result.data.count > 0) {
            toast.success(`Deleted ${result.data.count} ${result.data.count === 1 ? "log" : "logs"}`);
        }

        setIsOpen(false);
        clearSelection();
    }

    function handleOpenChange(open: boolean) {
        setIsOpen(open);
        if (!open) {
            setMessage("");
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Trigger asChild>
                <Button variant="transparent"  aria-label="Delete Logs">
                    <Trash className="size-4 hover:text-error" />
                </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/10" />
                <Dialog.Content className="bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[85vh] rounded-md p-6 bg-[var(--gray-1)] shadow-[var(--shadow-6)]">
                    <div className="pb-2 border-b flex items-center justify-between">
                        <Dialog.Title className="text-lg font-semibold ">Delete Logs</Dialog.Title>

                        <Dialog.Close asChild>
                            <Button aria-label="Close" variant="transparent">
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <Dialog.Description className="mt-8">
                        Are you sure you want to delete the selected logs? This action cannot be undone.
                    </Dialog.Description>

                    <form onSubmit={handleDelete} className="my-4">
                        <Input aria-label="Type delete to confirm"
                            placeholder="delete"
                            id="delete-confirmation"
                            value={message} onChange={(e) => setMessage(e.target.value)} />
                        <div
                            className="flex mt-4 justify-end gap-2"
                        >
                            <Dialog.Close asChild>
                                <Button type="button">
                                    Cancel
                                </Button>
                            </Dialog.Close>

                            <Button type="submit" variant="danger" disabled={message.toLowerCase() !== "delete"}>
                                Delete
                            </Button>
                        </div>
                    </form>



                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}