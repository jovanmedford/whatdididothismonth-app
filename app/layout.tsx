import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "./_components/toast/toaster";
import { cn } from "@/lib/utils";

const josefinSans = Josefin_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | WDIDTM",
    default: "What Did I Do This Month? | WDIDTM",
  },
  description: "Quick snapshots of what happened this month.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", josefinSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
