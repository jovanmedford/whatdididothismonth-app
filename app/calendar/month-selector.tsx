"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export default function MonthSelector({ searchMonth }: { searchMonth: number }) {
    const router = useRouter();

    function handleMonthChange(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
        const selectedMonth = event.target.value;
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("month", selectedMonth);
        router.push(`/calendar?${searchParams.toString()}`);
    }

    return (
        <div>
            <MonthSelect onChange={handleMonthChange} value={searchMonth} />
            <MonthRadioGroup onChange={handleMonthChange} value={searchMonth} />
        </div>
    )
}


function MonthSelect({ onChange, value }: { onChange: (event: ChangeEvent<HTMLSelectElement>) => void; value: number }) {
    return (
        <div className="md:hidden w-fit mx-auto mb-2">
            <select
                className="cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
                name="month"
                onChange={onChange}
                value={value}
            >

                {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                        {month.name.slice(0, 3)}
                    </option>
                ))}
            </select>
        </div>
    )
}

function MonthRadioGroup({ onChange, value }: { onChange: (event: ChangeEvent<HTMLInputElement>) => void; value: number }) {
    const isChecked = (monthValue: number) => monthValue === value;
    return (
        <div className="hidden md:flex  justify-between w-full py-2 border-t border-b">
            {MONTHS.map((month) => (
                <label
                    className={cn(
                        "block cursor-pointer rounded-3xl px-3 py-1 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-400",
                        isChecked(month.value)
                            ? "bg-primary-400 text-white hover:bg-primary-400/90"
                            : "hover:bg-highlight"
                    )}
                    key={month.value}
                >
                    <input className="sr-only" type="radio" name="month" value={month.value} onChange={onChange} checked={isChecked(month.value)} />
                    {month.name.slice(0, 3)}
                </label>
            ))}
        </div>
    )
}

const MONTHS = [
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 }
]