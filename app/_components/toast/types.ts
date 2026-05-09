
export type ToastType = {
    id: string;
    variant: "info" | "success" | "error";
    message: string;
    duration: number;
}

export type ToastListener = (toasts: ToastType[]) => void;