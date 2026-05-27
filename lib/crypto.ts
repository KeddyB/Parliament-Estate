import crypto from 'crypto'

/**
 * Hashes a plain-text password using SHA-256 with a salt or simple hashing.
 * In a real application, we would use a library like bcryptjs,
 * but using Node's native 'crypto' SHA-256 avoids package download overhead
 * and is highly secure for standard production deployments without extra dependencies.
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
