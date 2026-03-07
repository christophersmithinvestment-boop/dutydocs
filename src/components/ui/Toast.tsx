import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-24 right-4 z-[200] flex flex-col gap-2 pointer-events-none md:bottom-8">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300 pointer-events-auto",
                            toast.type === "success" && "bg-emerald-500 text-white border-emerald-400",
                            toast.type === "error" && "bg-rose-500 text-white border-rose-400",
                            toast.type === "info" && "bg-blue-500 text-white border-blue-400"
                        )}
                    >
                        {toast.type === "success" && <CheckCircle2 size={18} />}
                        {toast.type === "error" && <AlertCircle size={18} />}
                        {toast.type === "info" && <Info size={18} />}
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
