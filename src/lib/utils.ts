
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

<<<<<<< HEAD
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

    
=======
// Simple deterministic shuffle based on a seed
export function deterministicShuffle<T>(array: T[], seed: string): T[] {
    const shuffled = [...array];
    const hash = crypto.createHash('sha256').update(seed).digest();
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const hashInt = hash.readUInt32BE((i * 4) % (hash.length - 4));
        const j = hashInt % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};
>>>>>>> 56c742d778ee53cffcfe472680a4b87000408193
