import { AccountUserApi, BackupApi, DomainApi, InstallApi, SiteApi } from '../generated/api';
import { validate, validators } from './validators';

/**
 * Wraps API clients with validation
 */
export class ValidatedApiWrapper {
  /**
   * Wrap AccountUserApi with validation
   */
  public static wrapAccountUserApi(api: AccountUserApi): AccountUserApi {
    const wrapped = api as AccountUserApi;

    // Wrap createAccountUser
    const originalCreate = wrapped.createAccountUser.bind(wrapped);
    wrapped.createAccountUser = async (accountId: string, requestBody: any) => {
      validators.accountId(accountId);
      validate.userInput(requestBody.user);
      return originalCreate(accountId, requestBody);
    };

    // Wrap deleteAccountUser
    const originalDelete = wrapped.deleteAccountUser.bind(wrapped);
    wrapped.deleteAccountUser = async (accountId: string, userId: string) => {
      validators.accountId(accountId);
      validators.userId(userId);
      return originalDelete(accountId, userId);
    };

    // Wrap listAccountUsers
    const originalList = wrapped.listAccountUsers.bind(wrapped);
    wrapped.listAccountUsers = async (accountId: string) => {
      validators.accountId(accountId);
      return originalList(accountId);
    };

    return wrapped;
  }

  /**
   * Wrap BackupApi with validation
   */
  public static wrapBackupApi(api: BackupApi): BackupApi {
    const wrapped = api as BackupApi;

    // Wrap createBackup
    const originalCreate = wrapped.createBackup.bind(wrapped);
    wrapped.createBackup = async (installId: string, requestBody: any) => {
      validators.installId(installId);
      validate.backupInput(requestBody.backup);
      return originalCreate(installId, requestBody);
    };

    // Note: Removed listBackups as it's not in the API spec

    return wrapped;
  }

  /**
   * Wrap DomainApi with validation
   */
  public static wrapDomainApi(api: DomainApi): DomainApi {
    const wrapped = api as DomainApi;

    // Wrap createDomain
    const originalCreate = wrapped.createDomain.bind(wrapped);
    wrapped.createDomain = async (installId: string, requestBody: any) => {
      validators.installId(installId);
      validate.domainInput(requestBody.domain);
      return originalCreate(installId, requestBody);
    };

    return wrapped;
  }

  /**
   * Wrap InstallApi with validation
   */
  public static wrapInstallApi(api: InstallApi): InstallApi {
    const wrapped = api as InstallApi;

    // Wrap getInstall
    const originalGet = wrapped.getInstall.bind(wrapped);
    wrapped.getInstall = async (installId: string) => {
      validators.installId(installId);
      return originalGet(installId);
    };

    return wrapped;
  }

  /**
   * Wrap SiteApi with validation
   */
  public static wrapSiteApi(api: SiteApi): SiteApi {
    const wrapped = api as SiteApi;

    // Wrap getSite
    const originalGet = wrapped.getSite.bind(wrapped);
    wrapped.getSite = async (siteId: string) => {
      validators.uuid(siteId);
      return originalGet(siteId);
    };

    return wrapped;
  }
}
