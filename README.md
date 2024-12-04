# WP Engine TypeScript SDK

A TypeScript SDK for interacting with the WP Engine API. This SDK provides a simple and type-safe way to interact with WP Engine's services from both Node.js and browser environments.

## Features

- Full TypeScript support with complete type definitions
- Environment-based configuration
- Support for all WP Engine API endpoints
- Built-in authentication handling
- Comprehensive error handling
- Example implementations
- Unit and functional tests

## Installation

```bash
npm install wp-engine-api-typescript
```

## Configuration

The SDK supports configuration through environment variables or a configuration file. Create a `.env` file in your project root:

```ini
[Default]
WPENGINE_USERNAME=your-username
WPENGINE_PASSWORD=your-password

[Staging]
WPENGINE_USERNAME=staging-username
WPENGINE_PASSWORD=staging-password
```

## Basic Usage

```typescript
import { WPEngineSDK } from 'wp-engine-api-typescript';

// Initialize the SDK with default credentials
const sdk = new WPEngineSDK();

// Or specify a custom config file and profile
const sdk = new WPEngineSDK('./config/wpengine.env', 'Staging');

// Use the SDK
async function main() {
  try {
    // Get current user
    const user = await sdk.users.getCurrentUser();
    console.log('Current user:', user.data);

    // List accounts
    const accounts = await sdk.accounts.listAccounts();
    console.log('Accounts:', accounts.data);

    // List sites for an account
    const sites = await sdk.sites.listSites(undefined, undefined, undefined, 'account-id');
    console.log('Sites:', sites.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Available APIs

The SDK provides access to all WP Engine API endpoints through dedicated clients:

- `accounts` - Manage WP Engine accounts
- `accountUsers` - Manage account users
- `backups` - Manage site backups
- `cache` - Control site caching
- `domains` - Manage domain settings
- `installs` - Manage WordPress installations
- `sites` - Manage sites
- `sshKeys` - Manage SSH keys
- `status` - Check API status
- `users` - Manage user information

## Error Handling

The SDK uses Axios for HTTP requests and provides detailed error information:

```typescript
try {
  const sites = await sdk.sites.listSites();
} catch (error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error status:', error.response.status);
    console.error('Error data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message);
  }
}
```

## Examples

Check out the `examples` directory for more usage examples:

- `basic-usage.ts` - Basic SDK usage examples
- `site-management.ts` - Site management examples
- `backup-management.ts` - Backup management examples

### Running Examples

```bash
# First, run the setup script to configure your credentials
npm run setup

# Run examples using npm scripts
npm run example:basic     # Run basic usage example
npm run example:site      # Run site management example
npm run example:backup    # Run backup management example
```

## Development

### Building the SDK

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For support, please open an issue in the GitHub repository or contact WP Engine support.
