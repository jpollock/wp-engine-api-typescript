import * as fs from 'fs';
import * as path from 'path';

export interface WPEngineCredentials {
  username: string;
  password: string;
}

export interface WPEngineConfig {
  credentials: WPEngineCredentials;
  baseURL?: string;
}

export class ConfigurationManager {
  private static DEFAULT_BASE_URL = 'https://api.wpengineapi.com/v1';
  private config: { [key: string]: WPEngineConfig } = {};

  constructor(configPath?: string) {
    if (configPath) {
      this.loadFromFile(configPath);
    } else {
      // Try to load from default locations
      const defaultPaths = [
        './.env',
        path.join(process.env.HOME || '', '.wpengine', 'config'),
      ];

      for (const path of defaultPaths) {
        if (fs.existsSync(path)) {
          this.loadFromFile(path);
          break;
        }
      }
    }

    // Load from environment variables if available
    if (process.env.WPENGINE_USERNAME && process.env.WPENGINE_PASSWORD) {
      this.config['Default'] = {
        credentials: {
          username: process.env.WPENGINE_USERNAME,
          password: process.env.WPENGINE_PASSWORD,
        },
        baseURL: process.env.WPENGINE_API_URL || ConfigurationManager.DEFAULT_BASE_URL,
      };
    }
  }

  private loadFromFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = this.parseConfigFile(content);

    for (const [section, config] of Object.entries(parsed)) {
      this.config[section] = {
        credentials: {
          username: config.WPENGINE_USERNAME,
          password: config.WPENGINE_PASSWORD,
        },
        baseURL: config.WPENGINE_API_URL || ConfigurationManager.DEFAULT_BASE_URL,
      };
    }
  }

  private parseConfigFile(content: string): { [key: string]: { [key: string]: string } } {
    const lines = content.split('\n');
    let currentSection = 'Default';
    const config: { [key: string]: { [key: string]: string } } = {};
    config[currentSection] = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Check for section header
      const sectionMatch = trimmedLine.match(/^\[(.*)\]$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        config[currentSection] = {};
        continue;
      }

      // Parse key-value pairs
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        config[currentSection][key.trim()] = value;
      }
    }

    return config;
  }

  public getConfig(profile: string = 'Default'): WPEngineConfig {
    const config = this.config[profile];
    if (!config) {
      throw new Error(`Configuration profile '${profile}' not found`);
    }
    return config;
  }

  public getAllProfiles(): string[] {
    return Object.keys(this.config);
  }
}
