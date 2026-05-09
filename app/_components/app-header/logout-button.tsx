"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "../toast/store";
import { Button } from "../button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();
    async function handleLogout() {
        try {
            const { error } = await authClient.signOut()
            if (error) {
                toast.error("Failed to log out. Please try again.");
                console.error("Error signing out:", error);
            }

            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
            toast.error("Failed to log out. Please try again.");
        }
    }

    return (
        <Button onClick={handleLogout}>
            Logout
        </Button>
    );
}