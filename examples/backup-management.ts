import { WPEngineSDK } from '../src';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

async function showMenu(): Promise<string> {
  console.log('\nBackup Management Options:');
  console.log('1. Create new backup');
  console.log('2. Check backup status');
  console.log('3. Exit');
  
  return await question('\nSelect an option (1-3): ');
}

async function createBackup(sdk: WPEngineSDK): Promise<void> {
  try {
    const siteId = await question('Enter site ID: ');
    const description = await question('Enter backup description: ');
    const email = await question('Enter notification email: ');
    
    const response = await sdk.backups.createBackup(siteId, {
      description,
      notification_emails: [email]
    });
    
    console.log('\nBackup creation initiated!');
    console.log(`Backup ID: ${response.data.id}`);
    console.log(`Status: ${response.data.status}`);
    console.log('\nNote: The backup process may take several minutes to complete.');
    console.log('You will receive an email notification when the backup is ready.');
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

async function checkBackupStatus(sdk: WPEngineSDK): Promise<void> {
  try {
    const siteId = await question('Enter site ID: ');
    const backupId = await question('Enter backup ID: ');
    
    const backup = await sdk.backups.showBackup(siteId, backupId);
    
    console.log('\nBackup Status:');
    console.log(`ID: ${backup.data.id}`);
    console.log(`Status: ${backup.data.status}`);
  } catch (error) {
    console.error('Error checking backup status:', error);
  }
}

async function main(): Promise<void> {
  const sdk = new WPEngineSDK();

  try {
    console.log('Fetching available sites...');
    const sites = await sdk.installs.listInstalls();
    let exit = false;
    
    if (!sites.data.results || sites.data.results.length === 0) {
      console.log('No sites found. Please check your credentials and permissions.');
      exit = true;
    }

    console.log('\nAvailable sites:');
    if (sites.data.results) {
      sites.data.results.forEach(site => {
      console.log(`ID: ${site.id}, Name: ${site.name}`);
      });
    }
    while (!exit) {
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await createBackup(sdk);
        break;
      case '2':
        await checkBackupStatus(sdk);
        break;
      case '3':
        console.log('Exiting...');
        exit = true;
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

main().catch(console.error);
