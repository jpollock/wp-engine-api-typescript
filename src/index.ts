import { Configuration, ConfigurationParameters } from './generated/configuration';
import { AccountApi, AccountUserApi, BackupApi, CacheApi, DomainApi, InstallApi, SiteApi, SshKeyApi, StatusApi, UserApi } from './generated/api';
import { ConfigurationManager, WPEngineConfig, WPEngineCredentials } from './config';
import { ValidatedApiWrapper } from './validation/api-wrapper';
import { validators } from './validation/validators';
import { RateLimiter, RateLimitError } from './rate-limiter';
import axios, { AxiosError } from 'axios';

export interface SDKOptions {
  maxRequestsPerSecond?: number;
}

export class WPEngineSDK {
  private config: WPEngineConfig;
  private axiosConfig: Configuration;
  private rateLimiter: RateLimiter;

  // API Clients
  public readonly accounts: AccountApi;
  public readonly accountUsers: AccountUserApi;
  public readonly backups: BackupApi;
  public readonly cache: CacheApi;
  public readonly domains: DomainApi;
  public readonly installs: InstallApi;
  public readonly sites: SiteApi;
  public readonly sshKeys: SshKeyApi;
  public readonly status: StatusApi;
  public readonly users: UserApi;

  constructor(
    credentials?: WPEngineCredentials, 
    configPath?: string, 
    profile: string = 'Default',
    options: SDKOptions = {}
  ) {
    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(options.maxRequestsPerSecond);

    if (credentials) {
      // Validate provided credentials
      validators.credentials(credentials.username, credentials.password);
      
      // Use provided credentials directly
      this.config = {
        credentials: credentials,
        baseURL: 'https://api.wpengineapi.com/v1'
      };
    } else {
      // Load from config file or environment variables
      const configManager = new ConfigurationManager(configPath);
      this.config = configManager.getConfig(profile);
      
      // Validate loaded credentials
      validators.credentials(
        this.config.credentials.username,
        this.config.credentials.password
      );
    }

    const params: ConfigurationParameters = {
      baseOptions: {
        auth: {
          username: this.config.credentials.username,
          password: this.config.credentials.password,
        },
      },
      basePath: this.config.baseURL,
    };

    this.axiosConfig = new Configuration(params);

    // Initialize API clients with validation wrappers
    this.accounts = new AccountApi(this.axiosConfig);
    this.accountUsers = ValidatedApiWrapper.wrapAccountUserApi(
      new AccountUserApi(this.axiosConfig)
    );
    this.backups = new BackupApi(this.axiosConfig);
    this.cache = new CacheApi(this.axiosConfig);
    this.domains = ValidatedApiWrapper.wrapDomainApi(
      new DomainApi(this.axiosConfig)
    );
    this.installs = ValidatedApiWrapper.wrapInstallApi(
      new InstallApi(this.axiosConfig)
    );
    this.sites = ValidatedApiWrapper.wrapSiteApi(
      new SiteApi(this.axiosConfig)
    );
    this.sshKeys = new SshKeyApi(this.axiosConfig);
    this.status = new StatusApi(this.axiosConfig);
    this.users = new UserApi(this.axiosConfig);

    // Add request interceptor for rate limiting and validation
    axios.interceptors.request.use(async (config) => {
      // Apply rate limiting
      try {
        await this.rateLimiter.acquireToken();
      } catch (error) {
        throw new RateLimitError('Rate limit exceeded');
      }

      // Validate URLs
      if (config.url) {
        validators.url(config.url);
      }
      return config;
    });

    // Add response interceptor for error handling
    axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Clean sensitive data from error responses
          if (error.response.config?.auth) {
            delete error.response.config.auth;
          }
          if (error.response.config?.headers?.Authorization) {
            delete error.response.config.headers.Authorization;
          }
        }
        throw error;
      }
    );
  }

  /**
   * Get the current configuration
   */
  public getConfig(): WPEngineConfig {
    // Return a copy to prevent modification
    return { ...this.config };
  }

  /**
   * Get rate limiter statistics
   */
  public getRateLimiterStats() {
    return {
      availableTokens: this.rateLimiter.getAvailableTokens(),
      waitTime: this.rateLimiter.getWaitTime()
    };
  }
}

// Export types and utilities
export * from './generated/api';
export { ConfigurationManager, WPEngineCredentials } from './config';
export { ValidationError } from './validation/validators';
export { RateLimitError } from './rate-limiter';
