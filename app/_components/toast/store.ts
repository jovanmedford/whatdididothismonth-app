import { ToastType, ToastListener } from "./types";

let toasts: ToastType[] = [];
const listeners = new Set<ToastListener>();

function emit() {
    for (const listener of listeners) {
        listener(toasts);
    }
}

function add(variant: "info" | "success" | "error" = "info", message: string, duration: number = 3000) {
    const id = crypto.randomUUID();
    toasts = [...toasts, { id, variant, message, duration }];
    emit();

    return id;
}

function remove(id: string) {
    toasts = toasts.filter((toast) => toast.id !== id);
    emit();
}

export function subscribe(listener: ToastListener) {
    listeners.add(listener);
    listener(toasts);
    return () => listeners.delete(listener);
}

export const toast = {
    error: (message: string) => add("error", message),
    success: (message: string) => add("success", message),
    info: (message: string) => add("info", message),
    dismiss: (id: string) => remove(id),
};