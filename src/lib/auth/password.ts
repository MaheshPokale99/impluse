import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

// Cost 10 (OWASP's minimum) checks a password in ~70ms; 12 took ~300ms per sign-in.
const ROUNDS = 10;

export const hashPassword = (password: string) => bcrypt.hash(password, ROUNDS);

/** True for hashes made with a different cost, so they can be re-hashed at sign-in. */
export const needsRehash = (hash: string) => bcrypt.getRounds(hash) !== ROUNDS;

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export const generatePassword = (length = 12) =>
    Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join("");
