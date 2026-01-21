import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function calculateEntropy(data: string): number {
  const freq: Record<string, number> = {};
  for (const char of data) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = data.length;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

export function base64Encode(str: string): string {
  if (typeof window !== "undefined") {
    return btoa(str);
  }
  return Buffer.from(str).toString("base64");
}

export function base64Decode(str: string): string {
  if (typeof window !== "undefined") {
    return atob(str);
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
