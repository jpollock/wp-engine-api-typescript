/**
 * Validation Example
 * 
 * This example demonstrates the SDK's input validation capabilities, showing how
 * various types of invalid input are caught and handled before making API calls.
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
 * 4. Run: npm run example:validation
 */

// For package users:
// import { WPEngineSDK, ValidationError } from '@elasticapi/wpengine-typescript-sdk';

// For local development:
import { WPEngineSDK, ValidationError } from '../src';

async function demonstrateValidation(): Promise<void> {
  try {
    // Example 1: Invalid credentials
    console.log('\nTesting invalid credentials:');
    try {
      const _invalidSdk = new WPEngineSDK({
        username: '',  // Invalid: empty username
        password: 'test'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('Validation caught invalid credentials:', error.message);
      }
    }

    // Initialize SDK with valid credentials
    const sdk = new WPEngineSDK({
      username: process.env.WPENGINE_USERNAME || '',
      password: process.env.WPENGINE_PASSWORD || ''
    });

    // Example 2: Invalid account ID format
    console.log('\nTesting invalid account ID:');
    try {
      await sdk.accountUsers.listAccountUsers('invalid#id');
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('Validation caught invalid account ID:', error.message);
      }
    }

    // Example 3: Invalid user input
    console.log('\nTesting invalid user input:');
    try {
      await sdk.accountUsers.createAccountUser('valid-account-id', {
        user: {
          account_id: 'valid-account-id',
          first_name: '',  // Invalid: empty first name
          last_name: 'Doe',
          email: 'invalid-email',  // Invalid: bad email format
          roles: 'invalid-role'  // Invalid: not a valid role
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('Validation caught invalid user input:', error.message);
      }
    }

    // Example 4: Invalid backup description
    console.log('\nTesting invalid backup description:');
    try {
      await sdk.backups.createBackup('valid-install-id', {
        description: 'a'.repeat(300),  // Invalid: too long
        notification_emails: ['invalid-email']  // Invalid: bad email format
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('Validation caught invalid backup input:', error.message);
      }
    }

    // Example 5: Invalid domain input
    console.log('\nTesting invalid domain input:');
    try {
      await sdk.domains.createDomain('valid-install-id', {
        name: 'invalid..domain',  // Invalid: bad domain format
        primary: true
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('Validation caught invalid domain input:', error.message);
      }
    }

    // Example 6: Valid input demonstration
    console.log('\nTesting valid input:');
    try {
      const accounts = await sdk.accounts.listAccounts();
      if (accounts.data.results && accounts.data.results.length > 0) {
        const accountId = accounts.data.results[0].id;
        
        // This should pass validation
        await sdk.accountUsers.createAccountUser(accountId, {
          user: {
            account_id: accountId,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            roles: 'full'
          }
        });
        console.log('Successfully created user with valid input');
      }
    } catch (error) {
      console.error('Error with valid input:', error);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the validation examples
console.log('Running validation examples...');
demonstrateValidation().catch(console.error);

/*
Expected output:

Testing invalid credentials:
Validation caught invalid credentials: Username is required

Testing invalid account ID:
Validation caught invalid account ID: Invalid account ID format

Testing invalid user input:
Validation caught invalid user input: First name is required

Testing invalid backup description:
Validation caught invalid backup input: Description must be between 1 and 255 characters

Testing invalid domain input:
Validation caught invalid domain input: Invalid domain name format

Testing valid input:
Successfully created user with valid input
*/
