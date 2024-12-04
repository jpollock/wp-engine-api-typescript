import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WPEngineSDK } from '../../src';
import * as fs from 'fs';
import * as path from 'path';

describe('WPEngineSDK Functional Tests', () => {
  let sdk: WPEngineSDK;
  const testConfigPath = path.join(__dirname, 'test.env');

  beforeAll(() => {
    // Create a test config file
    const configContent = `
[Default]
WPENGINE_USERNAME=${process.env.WPENGINE_USERNAME || 'test-user'}
WPENGINE_PASSWORD=${process.env.WPENGINE_PASSWORD || 'test-pass'}
    `;
    fs.writeFileSync(testConfigPath, configContent);

    // Initialize SDK with test config
    sdk = new WPEngineSDK(testConfigPath);
  });

  afterAll(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  test('SDK initialization', () => {
    expect(sdk).toBeInstanceOf(WPEngineSDK);
    const config = sdk.getConfig();
    expect(config).toBeDefined();
    expect(config.credentials).toBeDefined();
    expect(config.credentials.username).toBeDefined();
    expect(config.credentials.password).toBeDefined();
  });

  test('API Status Check', async () => {
    const response = await sdk.status.status();
    expect(response.data).toBeDefined();
    expect(response.data.success).toBeDefined();
  });

  test('Current User', async () => {
    try {
      const response = await sdk.users.getCurrentUser();
      expect(response.data).toBeDefined();
      expect(response.data.id).toBeDefined();
      expect(response.data.email).toBeDefined();
    } catch (error: any) {
      // Skip test if credentials are not valid
      if (error.response && error.response.status === 401) {
        console.warn('Skipping user test - invalid credentials');
        return;
      }
      throw error;
    }
  });

  test('List Accounts', async () => {
    try {
      const response = await sdk.accounts.listAccounts();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.results)).toBe(true);
    } catch (error: any) {
      // Skip test if credentials are not valid
      if (error.response && error.response.status === 401) {
        console.warn('Skipping accounts test - invalid credentials');
        return;
      }
      throw error;
    }
  });

  test('Error Handling - Invalid Credentials', async () => {
    // Create SDK instance with invalid credentials
    const invalidSdk = new WPEngineSDK();
    invalidSdk['config'].credentials = {
      username: 'invalid',
      password: 'invalid'
    };

    await expect(async () => {
      await invalidSdk.accounts.listAccounts();
    }).rejects.toMatchObject({
      response: { status: 401 }
    });
  });

  test('Error Handling - Invalid Account ID', async () => {
    await expect(async () => {
      await sdk.accounts.getAccount('invalid-id');
    }).rejects.toMatchObject({
      response: { status: 404 }
    });
  });

  test('Pagination Parameters', async () => {
    try {
      const response = await sdk.sites.listSites(undefined, 5, 0);
      expect(response.data).toBeDefined();
      if (response.data.results && response.data.results.length > 0) {
        expect(response.data.results.length).toBeLessThanOrEqual(5);
      }
    } catch (error: any) {
      // Skip test if credentials are not valid
      if (error.response && error.response.status === 401) {
        console.warn('Skipping pagination test - invalid credentials');
        return;
      }
      throw error;
    }
  });

  test('Configuration Profile Selection', () => {
    // Test default profile
    const defaultSdk = new WPEngineSDK(testConfigPath);
    expect(defaultSdk.getConfig()).toBeDefined();

    // Test non-existent profile
    expect(() => {
      new WPEngineSDK(testConfigPath, 'NonExistent');
    }).toThrow();
  });

  test('Base URL Configuration', () => {
    const config = sdk.getConfig();
    expect(config.baseURL).toBe('https://api.wpengineapi.com/v1');
  });
});