'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg border transition-all animate-in slide-in-from-right fade-in",
                            t.type === 'success' ? "bg-white border-green-200 text-green-800" :
                                t.type === 'error' ? "bg-white border-red-200 text-red-800" :
                                    "bg-white border-gray-200 text-gray-800"
                        )}
                        role="alert"
                    >
                        <div className="flex-shrink-0">
                            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {t.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="ml-3 text-sm font-medium">{t.message}</div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-900 focus:ring-2 focus:ring-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
