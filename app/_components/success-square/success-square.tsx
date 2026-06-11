"use client";
import { useOptimistic, useState, useTransition } from "react";
import Square from "../square/square"
import { addSuccess, deleteSuccess } from "@/app/_data/success";
import { toast } from "../toast/store";


/**
 * Thin wrapper around Square that fires addSuccess and deleteSuccess on click, depending on the current state of the square.
 */
export function SuccessSquare({ activityLogId, day, initialChecked, isReached, className }: SuccessSquareProps) {
    const [checked, setChecked] = useState(initialChecked)
    const [optimisticChecked, setOptimisticChecked] = useOptimistic(checked)
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            const next = !optimisticChecked
            setOptimisticChecked(next)

            const result = next
                ? await addSuccess({ activityLogId, day })
                : await deleteSuccess({ activityLogId, day })

            if (!result.ok) {
                toast.error(result.error.message || "Something went wrong. Please try again.")
                return
            }

            startTransition(() => {
                setChecked(next)
            })
        })
    }

    return (
        <Square className={className} isChecked={optimisticChecked} isReached={isReached} onChange={handleToggle} disabled={isPending} />
    )
}


interface SuccessSquareProps {
    className?: string
    activityLogId: string
    day: number
    initialChecked: boolean
    isReached: boolean
}
