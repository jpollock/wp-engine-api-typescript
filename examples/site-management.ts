/**
 * Site Management Example
 * 
 * This example provides an interactive CLI tool for managing WP Engine sites and domains.
 * It demonstrates core SDK functionality including listing sites, managing domains,
 * and retrieving site details.
 * 
 * To run this example as a package user:
 * 1. Install the package: npm install @elasticapi/wpengine-typescript-sdk
 * 2. Create a new file with this content
 * 3. Update the import to use '@elasticapi/wpengine-typescript-sdk'
 * 4. Create a .env file with your credentials:
 *    WPENGINE_USERNAME=your-username
 *    WPENGINE_PASSWORD=your-password
 * 5. Run with: npx ts-node your-file.ts
 * 
 * To run this example during local development:
 * 1. Clone the repository
 * 2. Run: npm install
 * 3. Set up your .env file with credentials
 * 4. Run: npm run example:site
 */

// For package users:
// import { WPEngineSDK } from '@elasticapi/wpengine-typescript-sdk';

// For local development:
import { WPEngineSDK } from '../src';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

async function showMenu(): Promise<string> {
  console.log('\nSite Management Options:');
  console.log('1. List all sites');
  console.log('2. Get site details');
  console.log('3. List site domains');
  console.log('4. Add domain to site');
  console.log('5. Remove domain from site');
  console.log('6. Exit');
  
  return await question('\nSelect an option (1-6): ');
}

async function listSites(sdk: WPEngineSDK): Promise<void> {
  try {
    const sites = await sdk.installs.listInstalls();
    console.log('\nAvailable sites:');
    sites.data.results?.forEach(site => {
      console.log(`\nName: ${site.name}`);
      console.log(`ID: ${site.id}`);
      console.log(`Environment: ${site.environment}`);
      console.log(`Primary Domain: ${site.primary_domain}`);
      console.log(`Status: ${site.status}`);
    });
  } catch (error) {
    console.error('Error listing sites:', error);
  }
}

async function getSiteDetails(sdk: WPEngineSDK): Promise<void> {
  try {
    const siteId = await question('Enter site ID: ');
    const site = await sdk.installs.getInstall(siteId);
    
    console.log('\nSite Details:');
    console.log(`Name: ${site.data.name}`);
    console.log(`ID: ${site.data.id}`);
    console.log(`Environment: ${site.data.environment}`);
    console.log(`Primary Domain: ${site.data.primary_domain}`);
    console.log(`Status: ${site.data.status}`);
    console.log(`PHP Version: ${site.data.php_version}`);
  } catch (error) {
    console.error('Error getting site details:', error);
  }
}

async function listSiteDomains(sdk: WPEngineSDK): Promise<void> {
  try {
    const siteId = await question('Enter site ID: ');
    const domains = await sdk.domains.listDomains(siteId);
    
    console.log('\nSite Domains:');
    domains.data.results?.forEach(domain => {
      console.log(`\nName: ${domain.name}`);
      console.log(`Primary: ${domain.primary ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('Error listing domains:', error);
  }
}

async function addDomain(sdk: WPEngineSDK): Promise<void> {
  try {
    const siteId = await question('Enter site ID: ');
    const domainName = await question('Enter domain name: ');
    const setPrimary = (await question('Set as primary domain? (yes/no): ')).toLowerCase() === 'yes';
    
    await sdk.domains.createDomain(siteId, {
      name: domainName,
      primary: setPrimary
    });
    
    console.log('\nDomain added successfully!');
  } catch (error) {
    console.error('Error adding domain:', error);
  }
}

async function removeDomain(sdk: WPEngineSDK): Promise<void> {
  try {
    const siteId = await question('Enter site ID: ');
    const domainName = await question('Enter domain name to remove: ');
    
    await sdk.domains.deleteDomain(siteId, domainName);
    console.log('\nDomain removed successfully!');
  } catch (error) {
    console.error('Error removing domain:', error);
  }
}

async function main(): Promise<void> {
  // Initialize the SDK using environment variables
  const sdk = new WPEngineSDK();

  try {
    let exit = false;
    while (!exit) {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          await listSites(sdk);
          break;
        case '2':
          await getSiteDetails(sdk);
          break;
        case '3':
          await listSiteDomains(sdk);
          break;
        case '4':
          await addDomain(sdk);
          break;
        case '5':
          await removeDomain(sdk);
          break;
        case '6':
          exit = true;
          console.log('Exiting...');
          break;
        default:
          console.log('Invalid option. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the example
main().catch(console.error);
