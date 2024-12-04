import { WPEngineSDK } from '../src';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Helper function to display menu and get choice
async function showMenu(): Promise<string> {
  console.log('\nUser Management Options:');
  console.log('1. List users and roles for a specific account');
  console.log('2. Add user to an account');
  console.log('3. Remove user from an account');
  console.log('4. Add user to multiple accounts');
  console.log('5. Remove user from multiple accounts');
  console.log('6. Exit');
  
  return await question('\nSelect an option (1-6): ');
}

// Helper function to confirm action
async function confirmAction(preview: string): Promise<boolean> {
  console.log('\nPreview of changes:');
  console.log(preview);
  const confirm = await question('\nDo you want to proceed? (yes/no): ');
  return confirm.toLowerCase() === 'yes';
}

async function listUsersAndRoles(sdk: WPEngineSDK, accountId: string) {
  try {
    const users = await sdk.accountUsers.listAccountUsers(accountId);
    console.log('\nUsers and their roles:');
    users.data.results?.forEach(user => {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Roles: ${user.roles}`);
      console.log(`First Name: ${user.first_name}`);
      console.log(`Last Name: ${user.last_name}`);
      console.log(`Invite Accepted: ${user.invite_accepted}`);
      if (user.installs) {
        console.log('Installs:');
        user.installs.forEach(install => {
          console.log(`  - ${install.name} (${install.id})`);
        });
      }
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

async function addUserToAccount(sdk: WPEngineSDK, accountId: string) {
  try {
    const firstName = await question('Enter user first name: ');
    const lastName = await question('Enter user last name: ');
    const email = await question('Enter user email: ');
    console.log('\nAvailable roles:');
    console.log('- owner');
    console.log('- full,billing');
    console.log('- full');
    console.log('- partial,billing');
    console.log('- partial');
    const roles = await question('Enter role: ');
    
    let installIds: string[] = [];
    if (roles.includes('partial')) {
      const response = await sdk.installs.listInstalls(undefined, undefined, undefined, accountId);
      console.log('\nAvailable installs:');
      response.data.results?.forEach(install => {
        console.log(`${install.id}: ${install.name}`);
      });
      const installIdsInput = await question('Enter install IDs (comma-separated) or press enter to skip: ');
      if (installIdsInput.trim()) {
        installIds = installIdsInput.split(',').map(id => id.trim());
      }
    }
    
    const preview = `
    Adding user:
    Name: ${firstName} ${lastName}
    Email: ${email}
    Role: ${roles}
    To Account: ${accountId}
    ${installIds.length > 0 ? `Install Access: ${installIds.join(', ')}` : ''}
    `;
    
    if (await confirmAction(preview)) {
      await sdk.accountUsers.createAccountUser(accountId, {
        user: {
          account_id: accountId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          roles: roles,
          install_ids: installIds.length > 0 ? installIds : undefined
        }
      });
      console.log('User added successfully!');
    }
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

async function removeUserFromAccount(sdk: WPEngineSDK, accountId: string) {
  try {
    const users = await sdk.accountUsers.listAccountUsers(accountId);
    console.log('\nCurrent users:');
    users.data.results?.forEach(user => {
      console.log(`${user.user_id}: ${user.email} (${user.first_name} ${user.last_name})`);
    });
    
    const userId = await question('Enter user ID to remove: ');
    
    const preview = `
    Removing user with ID: ${userId}
    From Account: ${accountId}
    `;
    
    if (await confirmAction(preview)) {
      await sdk.accountUsers.deleteAccountUser(accountId, userId);
      console.log('User removed successfully!');
    }
  } catch (error) {
    console.error('Error removing user:', error);
  }
}

async function addUserToMultipleAccounts(sdk: WPEngineSDK) {
  try {
    const accounts = await sdk.accounts.listAccounts();
    console.log('\nAvailable accounts:');
    accounts.data.results?.forEach(account => {
      console.log(`${account.id}: ${account.name}`);
    });
    
    const accountIds = (await question('Enter account IDs (comma-separated): ')).split(',').map(id => id.trim());
    const firstName = await question('Enter user first name: ');
    const lastName = await question('Enter user last name: ');
    const email = await question('Enter user email: ');
    console.log('\nAvailable roles:');
    console.log('- owner');
    console.log('- full,billing');
    console.log('- full');
    console.log('- partial,billing');
    console.log('- partial');
    const roles = await question('Enter role: ');
    
    const preview = `
    Adding user:
    Name: ${firstName} ${lastName}
    Email: ${email}
    Role: ${roles}
    To Accounts: ${accountIds.join(', ')}
    `;
    
    if (await confirmAction(preview)) {
      for (const accountId of accountIds) {
        await sdk.accountUsers.createAccountUser(accountId, {
          user: {
            account_id: accountId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            roles: roles
          }
        });
        console.log(`User added to account ${accountId}`);
      }
      console.log('Completed adding user to all specified accounts!');
    }
  } catch (error) {
    console.error('Error adding user to multiple accounts:', error);
  }
}

async function removeUserFromMultipleAccounts(sdk: WPEngineSDK) {
  try {
    const accounts = await sdk.accounts.listAccounts();
    console.log('\nAvailable accounts:');
    for (const account of accounts.data.results || []) {
      const users = await sdk.accountUsers.listAccountUsers(account.id);
      console.log(`\nAccount: ${account.name} (${account.id})`);
      console.log('Users:');
      users.data.results?.forEach(user => {
        console.log(`  ${user.user_id}: ${user.email} (${user.first_name} ${user.last_name})`);
      });
    }
    
    const accountIds = (await question('\nEnter account IDs (comma-separated): ')).split(',').map(id => id.trim());
    const userId = await question('Enter user ID to remove: ');
    
    const preview = `
    Removing user with ID: ${userId}
    From Accounts: ${accountIds.join(', ')}
    `;
    
    if (await confirmAction(preview)) {
      for (const accountId of accountIds) {
        await sdk.accountUsers.deleteAccountUser(accountId, userId);
        console.log(`User removed from account ${accountId}`);
      }
      console.log('Completed removing user from all specified accounts!');
    }
  } catch (error) {
    console.error('Error removing user from multiple accounts:', error);
  }
}

async function main() {
  // Initialize the SDK with default credentials from .env file
  const sdk = new WPEngineSDK();

  try {
    console.log('Fetching available accounts...');
    const accounts = await sdk.accounts.listAccounts();
    
    if (!accounts.data.results || accounts.data.results.length === 0) {
      console.log('No accounts found. Please check your credentials and permissions.');
      return;
    }

    console.log('\nAvailable accounts:');
    accounts.data.results.forEach(account => {
      console.log(`ID: ${account.id}, Name: ${account.name}`);
    });

    const accountId = await question('\nEnter the account ID to work with: ');

    while (true) {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          await listUsersAndRoles(sdk, accountId);
          break;
        case '2':
          await addUserToAccount(sdk, accountId);
          break;
        case '3':
          await removeUserFromAccount(sdk, accountId);
          break;
        case '4':
          await addUserToMultipleAccounts(sdk);
          break;
        case '5':
          await removeUserFromMultipleAccounts(sdk);
          break;
        case '6':
          console.log('Exiting...');
          rl.close();
          return;
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
