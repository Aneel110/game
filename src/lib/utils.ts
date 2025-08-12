import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple deterministic shuffle based on team name
export const deterministicShuffle = (array: any[]) => {
    const sorted = [...array].sort((a, b) => a.teamName.localeCompare(b.teamName));
    const shuffled = [];
    let i = 0;
    let j = sorted.length - 1;
    while (i <= j) {
        if (i === j) {
            shuffled.push(sorted[i]);
        } else {
            shuffled.push(sorted[j]);
            shuffled.push(sorted[i]);
        }
        i++;
        j--;
    }
    return shuffled;
};

    