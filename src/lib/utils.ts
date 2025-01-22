import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  // Use the Supabase URL but remove any trailing slash
  return import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '');
} 