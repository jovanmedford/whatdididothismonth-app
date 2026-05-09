import { AppHeader } from "@/app/_components/app-header";

export function AppPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-10 mx-8">
            <AppHeader />
            {children}
        </div>
    );
}
