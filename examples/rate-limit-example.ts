/**
 * Rate Limiting Example
 * 
 * This example demonstrates the rate limiting capabilities of the WP Engine TypeScript SDK.
 * 
 * To run this example as a package user:
 * 1. Install the package: npm install @elasticapi/wpengine-typescript-sdk
 * 2. Create a new file with this content
 * 3. Update the import to use '@elasticapi/wpengine-typescript-sdk'
 * 
 * To run this example during local development:
 * 1. Clone the repository
 * 2. Run: npm install
 * 3. Run: npm run example:ratelimit
 */

// For package users:
// import { WPEngineSDK, RateLimitError } from '@elasticapi/wpengine-typescript-sdk';

// For local development:
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
