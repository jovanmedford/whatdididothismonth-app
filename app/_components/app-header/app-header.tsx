import { Logo } from "../logo";
import Link from "next/link";
import LogoutButton from "./logout-button";
import { verifySession } from "@/lib/dal";

export async function AppHeader() {
    const { user } = await verifySession();
    return (
        <header className="flex justify-between items-center mb-10">
            <Link href="/calendar">
                <Logo />
            </Link>
            <div className="flex gap-2 items-center">
                <span>{user.name}</span>
                <LogoutButton />
            </div>
        </header>
    );
}