// components/toaster.tsx
"use client";

import * as Toast from "@radix-ui/react-toast";
import { useSyncExternalStore } from "react";
import { subscribe, toast as toastApi } from "./store";
import { ToastType } from "./types";



let currentToasts: ToastType[] = [];

function getSnapshot() {
    return currentToasts;
}

function subscribeWithCache(listener: () => void) {
    return subscribe((toasts) => {
        currentToasts = toasts;
        listener();
    });
}

export function Toaster() {
    const toasts = useSyncExternalStore(
        subscribeWithCache,
        getSnapshot,
        getSnapshot, // server snapshot — same as client, toasts are always empty on server
    );

    return (
        <Toast.Provider swipeDirection="right">
            {toasts.map((t) => (
                <Toast.Root
                    key={t.id}
                    onOpenChange={(open) => {
                        if (!open) toastApi.dismiss(t.id);
                    }}
                    duration={t.duration}
                    className={
                        t.variant === "error"
                            ? "bg-red-50 border border-red-200 text-red-900 rounded-md p-4 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out"
                            : "bg-green-50 border border-green-200 text-green-900 rounded-md p-4 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out"
                    }
                >
                    <Toast.Description>{t.message}</Toast.Description>
                </Toast.Root>
            ))}
            <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-96 max-w-[100vw] z-50 outline-none" />
        </Toast.Provider>
    );
}