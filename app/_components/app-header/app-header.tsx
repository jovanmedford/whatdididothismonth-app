import { Logo } from "../logo";
import Link from "next/link";
import LogoutButton from "./logout-button";

export function AppHeader() {
    return (
        <header className="flex justify-between items-center mb-10">
            <Link href="/calendar">
                <Logo />
            </Link>
            <div className="flex gap-2 items-center">
                <span>John Doe</span>
                <LogoutButton />
            </div>
        </header>
    );
}