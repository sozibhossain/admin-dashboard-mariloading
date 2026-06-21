import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getName(user?: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}) {
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  return user?.name || fullName || user?.email || "Unknown user";
}

export function initials(name?: string) {
  return (name || "YR")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function totalPages(total?: number, limit?: number) {
  return Math.max(1, Math.ceil((total || 0) / (limit || 10)));
}
