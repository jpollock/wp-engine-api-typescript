import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { ConfigurationManager } from '../src/config';
import * as fs from 'fs';
import * as path from 'path';

describe('ConfigurationManager', () => {
  const testConfigPath = path.join(__dirname, 'test.env');

  beforeEach(() => {
    // Clean up any existing test config
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  test('loads default configuration from environment variables', () => {
    process.env.WPENGINE_USERNAME = 'test-user';
    process.env.WPENGINE_PASSWORD = 'test-pass';

    const config = new ConfigurationManager();
    const defaultConfig = config.getConfig();

    expect(defaultConfig.credentials.username).toBe('test-user');
    expect(defaultConfig.credentials.password).toBe('test-pass');
    expect(defaultConfig.baseURL).toBe('https://api.wpengineapi.com/v1');

    // Clean up
    delete process.env.WPENGINE_USERNAME;
    delete process.env.WPENGINE_PASSWORD;
  });

  test('loads configuration from file with multiple profiles', () => {
    const configContent = `
[Default]
WPENGINE_USERNAME=default-user
WPENGINE_PASSWORD=default-pass

[Staging]
WPENGINE_USERNAME=staging-user
WPENGINE_PASSWORD=staging-pass
WPENGINE_API_URL=https://staging-api.wpengineapi.com/v1
    `;

    fs.writeFileSync(testConfigPath, configContent);

    const config = new ConfigurationManager(testConfigPath);
    
    const defaultConfig = config.getConfig();
    expect(defaultConfig.credentials.username).toBe('default-user');
    expect(defaultConfig.credentials.password).toBe('default-pass');
    expect(defaultConfig.baseURL).toBe('https://api.wpengineapi.com/v1');

    const stagingConfig = config.getConfig('Staging');
    expect(stagingConfig.credentials.username).toBe('staging-user');
    expect(stagingConfig.credentials.password).toBe('staging-pass');
    expect(stagingConfig.baseURL).toBe('https://staging-api.wpengineapi.com/v1');
  });

  test('throws error for non-existent profile', () => {
    const config = new ConfigurationManager();
    expect(() => config.getConfig('NonExistent')).toThrow('Configuration profile \'NonExistent\' not found');
  });

  test('lists all available profiles', () => {
    const configContent = `
[Default]
WPENGINE_USERNAME=default-user
WPENGINE_PASSWORD=default-pass

[Staging]
WPENGINE_USERNAME=staging-user
WPENGINE_PASSWORD=staging-pass

[Production]
WPENGINE_USERNAME=prod-user
WPENGINE_PASSWORD=prod-pass
    `;

    fs.writeFileSync(testConfigPath, configContent);

    const config = new ConfigurationManager(testConfigPath);
    const profiles = config.getAllProfiles();

    expect(profiles).toContain('Default');
    expect(profiles).toContain('Staging');
    expect(profiles).toContain('Production');
    expect(profiles.length).toBe(3);
  });
});
