# WP Engine TypeScript SDK (Unofficial)

An unofficial TypeScript SDK for interacting with the WP Engine API. This SDK provides a simple and type-safe way to interact with WP Engine's services from both Node.js and browser environments.

> **Note**: This is an unofficial SDK and is not affiliated with or supported by WP Engine.

## Features

- Full TypeScript support with complete type definitions
- Environment-based configuration
- Support for all WP Engine API endpoints
- Built-in authentication handling
- Comprehensive input validation
- Secure error handling
- Example implementations
- Unit and functional tests
- Support for both CommonJS and ES Modules

## Installation

```bash
npm install wpengine-typescript-sdk
```

## Usage

There are several ways to initialize the SDK:

### 1. Direct Credentials

```typescript
import { WPEngineSDK } from 'wpengine-typescript-sdk';

const sdk = new WPEngineSDK({
  username: 'your-api-username',
  password: 'your-api-password'
});
```

### 2. Environment Variables

Create a `.env` file:

```ini
WPENGINE_USERNAME=your-api-username
WPENGINE_PASSWORD=your-api-password
```

Then initialize:

```typescript
const sdk = new WPEngineSDK();
```

### 3. Configuration File

Create a configuration file (e.g., `config.ini`):

```ini
[Default]
WPENGINE_USERNAME=your-api-username
WPENGINE_PASSWORD=your-api-password

[Production]
WPENGINE_USERNAME=prod-api-username
WPENGINE_PASSWORD=prod-api-password
```

Then initialize with a specific profile:

```typescript
const sdk = new WPEngineSDK(undefined, './config.ini', 'Production');
```

## Input Validation

The SDK includes comprehensive input validation to prevent errors and improve security:

```typescript
import { WPEngineSDK, ValidationError } from 'wpengine-typescript-sdk';

try {
  await sdk.accountUsers.createAccountUser('account-id', {
    user: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      roles: 'full'
    }
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
  }
}
```

See [Validation Documentation](docs/validation.md) for detailed information about the validation system.

## Security Best Practices

1. **Credential Storage**
   - Never commit credentials to version control
   - Use environment variables in production environments
   - Ensure configuration files have appropriate permissions (0600)

2. **Environment Variables**
   - Use different credentials for different environments
   - Rotate credentials regularly
   - Use the principle of least privilege

3. **Input Validation**
   - Always handle validation errors appropriately
   - Validate user input before making API calls
   - Use TypeScript types for additional type safety

## API Usage Examples

### User Management

```typescript
// List users in an account
const users = await sdk.accountUsers.listAccountUsers('account-id');

// Add a user to an account
await sdk.accountUsers.createAccountUser('account-id', {
  user: {
    account_id: 'account-id',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    roles: 'full'
  }
});

// Remove a user from an account
await sdk.accountUsers.deleteAccountUser('account-id', 'user-id');
```

### Site Management

```typescript
// List sites
const sites = await sdk.sites.listSites();

// Get site details
const site = await sdk.sites.getSite('site-id');
```

### Backup Management

```typescript
// List backups
const backups = await sdk.backups.listBackups('install-id');

// Create a backup
await sdk.backups.createBackup('install-id', {
  backup: {
    description: 'Pre-deployment backup'
  }
});
```

## Error Handling

The SDK uses standard Promise-based error handling with additional validation:

```typescript
try {
  const users = await sdk.accountUsers.listAccountUsers('account-id');
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
    console.error('Validation Error:', error.message);
  } else if (error.response) {
    // API error response
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Running Examples

```bash
npm run example:user
npm run example:site
npm run example:backup
npm run example:validation
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
