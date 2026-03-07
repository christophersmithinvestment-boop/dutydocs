import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)]",
                className
            )}
            {...props}
        />
    );
}

export function RecordSkeleton({ count = 1 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card card-compact flex items-center gap-3 mb-2 opacity-70">
                    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            ))}
        </>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-12 w-full mt-4" />
        </div>
    );
}
