import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// LocalStorage helpers
export function saveToStore<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`hs_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function loadFromStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`hs_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function deleteFromStore(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`hs_${key}`);
}

// ID generation
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Risk Matrix
export type RiskLevel = "low" | "medium" | "high" | "critical";

export function calculateRiskLevel(likelihood: number, severity: number): RiskLevel {
  const score = likelihood * severity;
  if (score <= 4) return "low";
  if (score <= 9) return "medium";
  if (score <= 16) return "high";
  return "critical";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low": return "var(--color-safety-green)";
    case "medium": return "var(--color-safety-yellow)";
    case "high": return "var(--color-safety-orange)";
    case "critical": return "var(--color-safety-red)";
  }
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "low": return "badge-green";
    case "medium": return "badge-yellow";
    case "high": return "badge-orange";
    case "critical": return "badge-red";
  }
}

// Date formatting
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}
