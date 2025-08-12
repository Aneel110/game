
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

    