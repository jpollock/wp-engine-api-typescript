import { WPEngineSDK } from '../src';
import { CreateSiteRequest, CreateInstallRequest, CreateDomainRequest } from '../src/generated/api';

async function main() {
  // Initialize the SDK
  const sdk = new WPEngineSDK();

  try {
    // First, get the list of accounts
    console.log('Fetching accounts...');
    const accountsResponse = await sdk.accounts.listAccounts();
    if (!accountsResponse.data.results?.length) {
      throw new Error('No accounts found');
    }

    const accountId = accountsResponse.data.results[0].id;
    console.log(`Using account: ${accountId}`);

    // Create a new site
    const siteName = `test-site-${Date.now()}`;
    console.log(`\nCreating new site: ${siteName}`);
    
    const createSiteRequest: CreateSiteRequest = {
      name: siteName,
      account_id: accountId
    };

    const siteResponse = await sdk.sites.createSite(createSiteRequest);
    const siteId = siteResponse.data.id;
    console.log(`Site created with ID: ${siteId}`);

    // Create a new install for the site
    console.log('\nCreating new install...');
    const createInstallRequest: CreateInstallRequest = {
      name: siteName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      account_id: accountId,
      site_id: siteId,
      environment: 'production'
    };

    const installResponse = await sdk.installs.createInstall(createInstallRequest);
    const installId = installResponse.data.id;
    console.log(`Install created with ID: ${installId}`);

    // Add domains to the install
    console.log('\nAdding domains...');
    const domains = [
      `${siteName.toLowerCase()}.example.com`,
      `www.${siteName.toLowerCase()}.example.com`
    ];

    // Add primary domain
    const primaryDomainRequest: CreateDomainRequest = {
      name: domains[0],
      primary: true
    };

    const primaryDomainResponse = await sdk.domains.createDomain(installId, primaryDomainRequest);
    console.log(`Primary domain added: ${primaryDomainResponse.data.name}`);

    // Add redirect domain
    const redirectDomainRequest: CreateDomainRequest = {
      name: domains[1],
      redirect_to: primaryDomainResponse.data.id
    };

    const redirectDomainResponse = await sdk.domains.createDomain(installId, redirectDomainRequest);
    console.log(`Redirect domain added: ${redirectDomainResponse.data.name}`);

    // List all domains for verification
    console.log('\nVerifying domains...');
    const domainsResponse = await sdk.domains.listDomains(installId);
    console.log('Current domains:');
    domainsResponse.data.results?.forEach(domain => {
      console.log(`- ${domain.name} ${domain.primary ? '(primary)' : domain.redirects_to ? '(redirect)' : ''}`);
    });

    // Demonstrate error handling
    console.log('\nDemonstrating error handling...');
    try {
      await sdk.domains.createDomain(installId, {
        name: 'invalid domain name',
        primary: false
      });
    } catch (error: any) {
      console.log('Expected error caught:', error.response?.data?.message || error.message);
    }

    // Clean up (optional - comment out to keep the test site)
    console.log('\nCleaning up...');
    await sdk.sites.deleteSite(siteId);
    console.log('Site deleted successfully');

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
