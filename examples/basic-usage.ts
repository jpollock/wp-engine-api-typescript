import { WPEngineSDK } from '../src';

async function main() {
  // Initialize the SDK with default credentials from .env file
  const sdk = new WPEngineSDK();

  try {
    // Check API status
    console.log('Checking API status...');
    const status = await sdk.status.status();
    console.log('API Status:', status.data);

    // Get current user
    console.log('\nGetting current user...');
    const user = await sdk.users.getCurrentUser();
    console.log('Current User:', user.data);

    // List accounts
    console.log('\nListing accounts...');
    const accounts = await sdk.accounts.listAccounts();
    console.log('Accounts:', accounts.data);

    // List sites for the first account
    if (accounts.data.results && accounts.data.results.length > 0) {
      const accountId = accounts.data.results[0].id;
      console.log(`\nListing sites for account ${accountId}...`);
      const sites = await sdk.sites.listSites(undefined, undefined, undefined, accountId);
      console.log('Sites:', sites.data);

      // List installs for the account
      console.log(`\nListing installs for account ${accountId}...`);
      const installs = await sdk.installs.listInstalls(undefined, undefined, undefined, accountId);
      console.log('Installs:', installs.data);

      // If there are any installs, list their domains
      if (installs.data.results && installs.data.results.length > 0) {
        const installId = installs.data.results[0].id;
        console.log(`\nListing domains for install ${installId}...`);
        const domains = await sdk.domains.listDomains(installId);
        console.log('Domains:', domains.data);
      }
    }

    // List SSH keys
    console.log('\nListing SSH keys...');
    const sshKeys = await sdk.sshKeys.listSshKeys();
    console.log('SSH Keys:', sshKeys.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);
