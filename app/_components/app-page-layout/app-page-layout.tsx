import { AppHeader } from "@/app/_components/app-header";
import { Container } from "@/app/_components/container";

export function AppPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-10 px-8">
            <Container>
                <AppHeader />
                {children}
            </Container>
        </div>
    );
}
