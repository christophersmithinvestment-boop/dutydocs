import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isClient() {
  return typeof window !== "undefined";
}

// LocalStorage helpers
// Throws on failure (most often a full quota) so callers can tell the
// user rather than losing the record silently.
export function saveToStore<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`hs_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error("This device is out of storage space for DutyDocs.");
    }
    throw e;
  }
}

// Distinguishes "nothing saved yet" from "saved data is unreadable".
// Returning the fallback for both made a corrupted module look identical
// to an empty one, with no sign anything had gone wrong.
export function loadFromStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(`hs_${key}`);
  if (item === null || item === "") return fallback;
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`[DutyDocs] Corrupted data in hs_${key}:`, e);
    throw new Error("Saved data on this device is corrupted and couldn't be read.");
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

// Expiry logic
export type ExpiryStatus = "valid" | "expiring" | "expired" | "none";

export function getExpiryStatus(date: string | Date | undefined): ExpiryStatus {
  if (!date) return "none";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "none";

  const now = new Date();
  // Set to start of day for cleaner comparison
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);

  const diff = checkDate.getTime() - now.getTime();
  if (diff < 0) return "expired";
  if (diff < 30 * 24 * 60 * 60 * 1000) return "expiring";
  return "valid";
}

export function getExpiryBadgeClass(status: ExpiryStatus): string {
  switch (status) {
    case "valid": return "badge-green";
    case "expiring": return "badge-yellow";
    case "expired": return "badge-red";
    default: return "badge-blue";
  }
}
