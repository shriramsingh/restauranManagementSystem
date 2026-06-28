/**
 * Simple in-memory rate limiter for Next.js API routes.
 * In production with multiple instances, replace with Redis (e.g., rate-limiter-flexible).
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 5 // max requests per window

export function rateLimit(key: string): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, resetTime: now + WINDOW_MS }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, limit: MAX_REQUESTS, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count += 1
  return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - entry.count, resetTime: entry.resetTime }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  })
}, 60 * 1000) // every minute
