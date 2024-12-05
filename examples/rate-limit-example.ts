import { WPEngineSDK, RateLimitError } from '../src';

async function demonstrateRateLimiting(): Promise<void> {
  // Initialize SDK with 5 requests per second limit
  const sdk = new WPEngineSDK(undefined, '.env', 'Default', {
    maxRequestsPerSecond: 1
  });

  console.log('Demonstrating rate limiting...');

  // Function to make a sample API call
  const makeApiCall = async (index: number): Promise<void> => {
    try {
      const before = sdk.getRateLimiterStats();
      console.log(`Request ${index}: Available tokens before: ${before.availableTokens}`);
      
      const start = Date.now();
      // Using listSites instead of listBackups
      await sdk.sites.listSites();
      const duration = Date.now() - start;
      
      const after = sdk.getRateLimiterStats();
      console.log(`Request ${index}: Completed in ${duration}ms. Available tokens after: ${after.availableTokens}`);
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.log(`Request ${index}: Rate limit exceeded. Waiting...`);
      } else {
        console.error(`Request ${index}: Error:`, error);
      }
    }
  };

  // Demonstrate burst handling
  console.log('\nTesting burst of requests...');
  const requests = Array.from({ length: 10 }, (_, i) => makeApiCall(i + 1));
  await Promise.all(requests);

  // Demonstrate sustained rate
  console.log('\nTesting sustained request rate...');
  for (let i = 1; i <= 15; i++) {
    await makeApiCall(i);
  }

  // Demonstrate rate limiter stats
  console.log('\nRate Limiter Stats:');
  const stats = sdk.getRateLimiterStats();
  console.log('Available tokens:', stats.availableTokens);
  console.log('Wait time for next token (ms):', stats.waitTime);

  // Demonstrate recovery
  console.log('\nWaiting for rate limit recovery...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  const recoveryStats = sdk.getRateLimiterStats();
  console.log('Available tokens after recovery:', recoveryStats.availableTokens);
}

// Run the rate limiting example
console.log('Running rate limiting examples...');
demonstrateRateLimiting().catch(console.error);

/*
Expected output:

Running rate limiting examples...
Demonstrating rate limiting...

Testing burst of requests...
Request 1: Available tokens before: 5
Request 2: Available tokens before: 4
Request 3: Available tokens before: 3
Request 4: Available tokens before: 2
Request 5: Available tokens before: 1
Request 6: Rate limit exceeded. Waiting...
Request 7: Rate limit exceeded. Waiting...
Request 8: Rate limit exceeded. Waiting...
Request 9: Rate limit exceeded. Waiting...
Request 10: Rate limit exceeded. Waiting...
Request 1: Completed in 150ms. Available tokens after: 0
Request 2: Completed in 155ms. Available tokens after: 0
Request 3: Completed in 160ms. Available tokens after: 0
Request 4: Completed in 165ms. Available tokens after: 0
Request 5: Completed in 170ms. Available tokens after: 0

Testing sustained request rate...
Request 1: Available tokens before: 1
Request 1: Completed in 150ms. Available tokens after: 0
Request 2: Rate limit exceeded. Waiting...
Request 2: Completed in 350ms. Available tokens after: 0
...

Rate Limiter Stats:
Available tokens: 0
Wait time for next token (ms): 200

Waiting for rate limit recovery...
Available tokens after recovery: 5
*/
