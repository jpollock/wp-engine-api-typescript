/**
 * Basic Usage Example
 * 
 * This example demonstrates the core functionality of the WP Engine TypeScript SDK,
 * including authentication, error handling, pagination, and common API operations.
 * 
 * To run this example as a package user:
 * 1. Install the package: npm install @elasticapi/wpengine-typescript-sdk
 * 2. Create a new file with this content
 * 3. Update the import to use '@elasticapi/wpengine-typescript-sdk'
 * 4. Create a .env file with your credentials:
 *    WPENGINE_USERNAME=your-username
 *    WPENGINE_PASSWORD=your-password
 * 
 * To run this example during local development:
 * 1. Clone the repository
 * 2. Run: npm install
 * 3. Set up your .env file with credentials
 * 4. Run: npm run example:basic
 */

// For package users:
// import { WPEngineSDK } from '@elasticapi/wpengine-typescript-sdk';

// For local development:
import { WPEngineSDK } from '../src';

async function main(): Promise<void> {
  // Initialize the SDK
  const sdk = new WPEngineSDK();

  try {
    // Example 1: Get Current User Information
    console.log('\nFetching current user information...');
    const currentUser = await sdk.users.getCurrentUser();
    console.log('Current user:', {
      id: currentUser.data.id,
      email: currentUser.data.email,
      name: `${currentUser.data.first_name} ${currentUser.data.last_name}`
    });

    // Example 2: List Accounts
    console.log('\nFetching accounts...');
    const accounts = await sdk.accounts.listAccounts();
    console.log('Available accounts:', accounts.data.results?.map(account => ({
      id: account.id,
      name: account.name
    })));

    // Example 3: Error Handling
    console.log('\nDemonstrating error handling...');
    try {
      await sdk.installs.getInstall('invalid-id');
    } catch (error: any) {
      console.log('Handled error gracefully:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    // Example 4: List Sites with Pagination
    console.log('\nDemonstrating pagination...');
    const firstPage = await sdk.installs.listInstalls(undefined, 5); // Get first 5 items
    console.log('First page results:', firstPage.data.results?.map(site => ({
      id: site.id,
      name: site.name
    })));

    if (firstPage.data.next) {
      const secondPage = await sdk.installs.listInstalls(undefined, 5, 5); // offset by 5
      console.log('Second page results:', secondPage.data.results?.map(site => ({
        id: site.id,
        name: site.name
      })));
    }

    // Example 5: Working with Sites
    if (accounts.data.results?.[0]) {
      const accountId = accounts.data.results[0].id;
      console.log(`\nFetching sites for account ${accountId}...`);
      
      const sites = await sdk.installs.listInstalls(undefined, undefined, undefined, accountId);
      console.log('Sites:', sites.data.results?.map(site => ({
        id: site.id,
        name: site.name,
        environment: site.environment,
        php_version: site.php_version
      })));

      // If there's at least one site, get its domains
      if (sites.data.results?.[0]) {
        const siteId = sites.data.results[0].id;
        console.log(`\nFetching domains for site ${siteId}...`);
        
        const domains = await sdk.domains.listDomains(siteId);
        console.log('Domains:', domains.data.results?.map(domain => ({
          id: domain.id,
          name: domain.name,
          primary: domain.primary
        })));
      }
    }

    // Example 6: Working with SSH Keys
    console.log('\nFetching SSH keys...');
    const sshKeys = await sdk.sshKeys.listSshKeys();
    console.log('SSH Keys:', sshKeys.data.results?.map(key => ({
      id: key.uuid,
      fingerprint: key.fingerprint,
      created_at: key.created_at
    })));

    // Example 7: Parallel Operations
    console.log('\nDemonstrating parallel operations...');
    const [accountsData, sitesData, userData] = await Promise.all([
      sdk.accounts.listAccounts(),
      sdk.installs.listInstalls(),
      sdk.users.getCurrentUser()
    ]);
    
    console.log('Parallel fetch results:', {
      accountCount: accountsData.data.results?.length || 0,
      siteCount: sitesData.data.results?.length || 0,
      user: userData.data.email
    });

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the examples
main().catch(console.error);
