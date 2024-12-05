/**
 * Token bucket rate limiter implementation
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number; // milliseconds

  constructor(maxRequestsPerSecond: number = 5) {
    this.maxTokens = maxRequestsPerSecond;
    this.tokens = maxRequestsPerSecond;
    this.lastRefill = Date.now();
    this.refillRate = maxRequestsPerSecond;
    this.refillInterval = 1000; // 1 second in milliseconds
  }

  /**
   * Refills tokens based on time elapsed
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / this.refillInterval) * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Checks if a request can be made and consumes a token if available
   * @returns Promise that resolves when a token is available
   */
  public async acquireToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // Calculate wait time until next token is available
    const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.refillTokens();
        this.tokens -= 1;
        resolve();
      }, waitTime);
    });
  }

  /**
   * Gets the number of tokens currently available
   */
  public getAvailableTokens(): number {
    this.refillTokens();
    return this.tokens;
  }

  /**
   * Gets the time in milliseconds until the next token will be available
   */
  public getWaitTime(): number {
    this.refillTokens();
    if (this.tokens >= 1) return 0;
    return ((1 - this.tokens) / this.refillRate) * 1000;
  }
}

/**
 * Rate limiter error class
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
