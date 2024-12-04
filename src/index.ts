import { Configuration, ConfigurationParameters } from './generated/configuration';
import { AccountApi, AccountUserApi, BackupApi, CacheApi, DomainApi, InstallApi, SiteApi, SshKeyApi, StatusApi, UserApi } from './generated/api';
import { ConfigurationManager, WPEngineConfig } from './config';
import axios from 'axios';

export class WPEngineSDK {
  private config: WPEngineConfig;
  private axiosConfig: Configuration;

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

  constructor(configPath?: string, profile: string = 'Default') {
    const configManager = new ConfigurationManager(configPath);
    this.config = configManager.getConfig(profile);

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

    // Initialize API clients
    this.accounts = new AccountApi(this.axiosConfig);
    this.accountUsers = new AccountUserApi(this.axiosConfig);
    this.backups = new BackupApi(this.axiosConfig);
    this.cache = new CacheApi(this.axiosConfig);
    this.domains = new DomainApi(this.axiosConfig);
    this.installs = new InstallApi(this.axiosConfig);
    this.sites = new SiteApi(this.axiosConfig);
    this.sshKeys = new SshKeyApi(this.axiosConfig);
    this.status = new StatusApi(this.axiosConfig);
    this.users = new UserApi(this.axiosConfig);
  }

  /**
   * Get the current configuration
   */
  public getConfig(): WPEngineConfig {
    return this.config;
  }
}

// Export types from generated code
export * from './generated/api';
export { ConfigurationManager } from './config';
