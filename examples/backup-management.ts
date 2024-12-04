import { WPEngineSDK } from '../src';
import { CreateBackupRequest } from '../src/generated/api';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForBackup(sdk: WPEngineSDK, installId: string, backupId: string): Promise<void> {
  console.log('Waiting for backup to complete...');
  
  while (true) {
    const response = await sdk.backups.showBackup(installId, backupId);
    const status = response.data.status;
    
    console.log(`Current status: ${status}`);
    
    if (status === 'complete') {
      console.log('Backup completed successfully!');
      break;
    } else if (status === 'failed') {
      throw new Error('Backup failed');
    }
    
    // Wait 10 seconds before checking again
    await sleep(10000);
  }
}

async function main() {
  // Initialize the SDK
  const sdk = new WPEngineSDK();

  try {
    // First, get the list of installs
    console.log('Fetching installs...');
    const installsResponse = await sdk.installs.listInstalls();
    if (!installsResponse.data.results?.length) {
      throw new Error('No installs found');
    }

    // Get the first install for demonstration
    const install = installsResponse.data.results[0];
    if (!install.id) {
      throw new Error('Install ID is missing');
    }
    console.log(`Using install: ${install.name} (${install.id})`);

    // Create a backup request
    console.log('\nInitiating backup...');
    const backupRequest: CreateBackupRequest = {
      description: `Automated backup created at ${new Date().toISOString()}`,
      notification_emails: ['admin@example.com'] // Replace with actual email
    };

    // Create the backup
    const backupResponse = await sdk.backups.createBackup(install.id, backupRequest);
    if (!backupResponse.data.id) {
      throw new Error('Backup ID is missing from response');
    }
    const backupId = backupResponse.data.id;
    console.log(`Backup initiated with ID: ${backupId}`);

    // Wait for backup to complete
    await waitForBackup(sdk, install.id, backupId);

    // Demonstrate error handling by trying to get a non-existent backup
    console.log('\nDemonstrating error handling...');
    try {
      await sdk.backups.showBackup(install.id, 'non-existent-backup-id');
    } catch (error: any) {
      console.log('Expected error caught:', error.response?.data?.message || error.message);
    }

    // Demonstrate cache management
    console.log('\nManaging cache...');
    
    // Purge object cache
    console.log('Purging object cache...');
    await sdk.cache.purgeCache(install.id, { type: 'object' });
    console.log('Object cache purged');

    // Wait a bit before purging page cache
    await sleep(2000);

    // Purge page cache
    console.log('Purging page cache...');
    await sdk.cache.purgeCache(install.id, { type: 'page' });
    console.log('Page cache purged');

    // Wait a bit before purging CDN cache
    await sleep(2000);

    // Purge CDN cache
    console.log('Purging CDN cache...');
    await sdk.cache.purgeCache(install.id, { type: 'cdn' });
    console.log('CDN cache purged');

    console.log('\nAll operations completed successfully!');

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for testing
export { waitForBackup };
