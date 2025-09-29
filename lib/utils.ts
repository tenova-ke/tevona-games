import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind + conditional classes
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
    }
