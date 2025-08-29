// src/auth/hash.ts
import bcrypt from "bcrypt";

/**
 * Hash a plaintext password with bcrypt.
 * Increasing rounds (12) gives reasonable security for a prototype.
 */
export const hash = (s: string) => bcrypt.hash(s, 12);

/**
 * Verify plaintext vs stored hash.
 */
export const verify = (s: string, h: string) => bcrypt.compare(s, h);
