# WP Engine TypeScript SDK (Unofficial)

An unofficial TypeScript SDK for interacting with the WP Engine API. This SDK provides a simple and type-safe way to interact with WP Engine's services from both Node.js and browser environments.

> **Note**: This is an unofficial SDK and is not affiliated with or supported by WP Engine.

## Features

- Full TypeScript support with complete type definitions
- Environment-based configuration
- Support for all WP Engine API endpoints
- Built-in authentication handling
- Comprehensive error handling
- Example implementations
- Unit and functional tests
- Support for both CommonJS and ES Modules

## Installation

```bash
npm install wpengine-typescript-sdk
```

## Usage

### ES Modules (Recommended)

```typescript
import { WPEngineSDK } from 'wpengine-typescript-sdk';

// Initialize the SDK with default credentials
const sdk = new WPEngineSDK();
```

### CommonJS

```typescript
const { WPEngineSDK } = require('wpengine-typescript-sdk');

// Initialize the SDK with default credentials
const sdk = new WPEngineSDK();
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
import { WPEngineSDK } from 'wpengine-typescript-sdk';

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

### Publishing to npm

To publish a new version to npm:

1. Update the version in package.json:
```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

2. Build and publish:
```bash
npm run build
npm publish
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Disclaimer

This SDK is not officially associated with WP Engine. It is a community-developed tool designed to work with WP Engine's public API. Use at your own discretion.

## Support

For support, please open an issue in the GitHub repository. Note that this is a community-supported project and is not officially supported by WP Engine.
