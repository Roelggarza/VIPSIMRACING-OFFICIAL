/**
 * Performance optimization utilities for VIP SIM RACING application
 */

// Cache management
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const performanceCache = new PerformanceCache();

// Debounce utility for search and input optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Lazy loading utility for images
export const createImageLoader = () => {
  const imageCache = new Set<string>();
  
  return {
    preloadImage: (src: string): Promise<void> => {
      if (imageCache.has(src)) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    
    preloadImages: async (sources: string[]): Promise<void> => {
      const promises = sources
        .filter(src => !imageCache.has(src))
        .map(src => this.preloadImage(src));
      
      await Promise.allSettled(promises);
    }
  };
};

// Batch operations for database efficiency
export class BatchProcessor<T> {
  private queue: T[] = [];
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private processor: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    flushInterval: number = 1000
  ) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
  }

  add(item: T): void {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const items = this.queue.splice(0);
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    try {
      await this.processor(items);
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Re-queue failed items for retry
      this.queue.unshift(...items);
    }
  }
}

// Virtual scrolling for large lists
export const createVirtualScrollConfig = (
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  return {
    itemHeight,
    containerHeight,
    overscan,
    
    getVisibleRange: (scrollTop: number, totalItems: number) => {
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
      
      return { startIndex, endIndex, visibleCount };
    }
  };
};

// Memory management for large datasets
export const createDataManager = <T extends { id: string }>() => {
  const dataMap = new Map<string, T>();
  const accessTimes = new Map<string, number>();
  const maxSize = 1000; // Maximum items to keep in memory
  
  return {
    set: (item: T) => {
      dataMap.set(item.id, item);
      accessTimes.set(item.id, Date.now());
      
      // Cleanup old items if we exceed max size
      if (dataMap.size > maxSize) {
        const sortedByAccess = Array.from(accessTimes.entries())
          .sort(([, a], [, b]) => a - b);
        
        const toRemove = sortedByAccess.slice(0, Math.floor(maxSize * 0.1));
        toRemove.forEach(([id]) => {
          dataMap.delete(id);
          accessTimes.delete(id);
        });
      }
    },
    
    get: (id: string): T | undefined => {
      const item = dataMap.get(id);
      if (item) {
        accessTimes.set(id, Date.now());
      }
      return item;
    },
    
    has: (id: string): boolean => dataMap.has(id),
    
    delete: (id: string): boolean => {
      accessTimes.delete(id);
      return dataMap.delete(id);
    },
    
    clear: () => {
      dataMap.clear();
      accessTimes.clear();
    },
    
    size: () => dataMap.size
  };
};

// Async queue for non-blocking operations
export class AsyncQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private readonly concurrency: number;
  private activePromises = 0;

  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.activePromises >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.activePromises++;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } catch (error) {
        console.error('Queue task failed:', error);
      } finally {
        this.activePromises--;
        this.process(); // Process next task
      }
    }
  }
}

// Global instances
export const imageLoader = createImageLoader();
export const asyncQueue = new AsyncQueue(3);

// Performance monitoring
export const performanceMonitor = {
  startTiming: (label: string): () => void => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
      
      // Store performance metrics
      const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
      if (!metrics[label]) metrics[label] = [];
      
      metrics[label].push({
        duration,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 measurements per metric
      if (metrics[label].length > 100) {
        metrics[label] = metrics[label].slice(-100);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    };
  },
  
  getMetrics: (label?: string) => {
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
    return label ? metrics[label] : metrics;
  },
  
  clearMetrics: () => {
    localStorage.removeItem('performance_metrics');
  }
};

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  performanceCache.cleanup();
}, 5 * 60 * 1000);