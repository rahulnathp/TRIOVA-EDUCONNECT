import { Injectable } from '@nestjs/common';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  constructor() {
    // Clean up expired cache every 10 minutes
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 10 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttlMinutes: number = 50): void {
    const now = Date.now();
    const expiresAt = now + (ttlMinutes * 60 * 1000);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
    
    console.log(`📦 Cached item: ${key} (expires in ${ttlMinutes} minutes)`);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      console.log(`⏰ Cache expired: ${key}`);
      return null;
    }
    
    const remainingMinutes = Math.ceil((item.expiresAt - Date.now()) / (60 * 1000));
    console.log(`📦 Cache hit: ${key} (${remainingMinutes} minutes remaining)`);
    return item.data;
  }

  invalidate(key: string): void {
    if (this.cache.delete(key)) {
      console.log(`🗑️ Cache invalidated: ${key}`);
    }
  }

  invalidatePattern(pattern: string): void {
    let deletedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    console.log(`🗑️ Cache pattern invalidated: ${pattern} (${deletedCount} items)`);
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ All cache cleared (${size} items)`);
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache items`);
    }
  }

  getCacheStats(): { size: number; keys: string[]; details: any } {
    const now = Date.now();
    const details = {};
    
    for (const [key, item] of this.cache.entries()) {
      const remainingMinutes = Math.ceil((item.expiresAt - now) / (60 * 1000));
      details[key] = {
        timestamp: new Date(item.timestamp).toISOString(),
        expiresAt: new Date(item.expiresAt).toISOString(),
        remainingMinutes: remainingMinutes > 0 ? remainingMinutes : 0,
        isExpired: now > item.expiresAt
      };
    }
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      details
    };
  }
}
