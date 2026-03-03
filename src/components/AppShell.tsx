"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const AUTH_PAGES = ["/login", "/signup", "/landing"];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = AUTH_PAGES.includes(pathname);

    return (
        <AuthProvider>
            {!isAuthPage && <Sidebar className="hidden md:flex" />}

            <main className="flex-1 overflow-y-auto min-h-dvh pb-safe md:pb-0">
                <div className="page-enter">{children}</div>
            </main>

            {!isAuthPage && <BottomNav />}
            <ServiceWorkerRegistration />
        </AuthProvider>
    );
}
