
"use client";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

export default function YearSelector({ searchYear }: { searchYear: number }) {
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
        const selectedYear = event.target.value;
        router.push(`/calendar?year=${selectedYear}`);
    }

    return (
        <div className="text-align-center mx-auto text-md w-fit my-2 md:my-0 md:mx-0">
            <select name="year" aria-label="Select Year" value={searchYear} onChange={handleYearChange}>
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
        </div>
    )
}