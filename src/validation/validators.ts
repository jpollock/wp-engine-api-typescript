/**
 * Common validation patterns
 */
export const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  // WP Engine specific patterns
  installId: /^[a-zA-Z0-9-]+$/,
  accountId: /^[a-zA-Z0-9-]+$/,
  userId: /^[a-zA-Z0-9-]+$/,
  roles: /^(owner|full,billing|full|partial,billing|partial)$/,
};

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Input validators
 */
export const validators = {
  /**
   * Validate email address
   */
  email(email: string): boolean {
    if (!email || !patterns.email.test(email)) {
      throw new ValidationError('Invalid email address format');
    }
    return true;
  },

  /**
   * Validate UUID format
   */
  uuid(id: string): boolean {
    if (!id || !patterns.uuid.test(id)) {
      throw new ValidationError('Invalid UUID format');
    }
    return true;
  },

  /**
   * Validate install ID format
   */
  installId(id: string): boolean {
    if (!id || !patterns.installId.test(id)) {
      throw new ValidationError('Invalid install ID format');
    }
    return true;
  },

  /**
   * Validate account ID format
   */
  accountId(id: string): boolean {
    if (!id || !patterns.accountId.test(id)) {
      throw new ValidationError('Invalid account ID format');
    }
    return true;
  },

  /**
   * Validate user ID format
   */
  userId(id: string): boolean {
    if (!id || !patterns.userId.test(id)) {
      throw new ValidationError('Invalid user ID format');
    }
    return true;
  },

  /**
   * Validate user roles
   */
  roles(roles: string): boolean {
    if (!roles || !patterns.roles.test(roles)) {
      throw new ValidationError('Invalid role format. Must be one of: owner, full,billing, full, partial,billing, partial');
    }
    return true;
  },

  /**
   * Validate string is not empty
   */
  required(value: string, fieldName: string): boolean {
    if (!value || value.trim().length === 0) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return true;
  },

  /**
   * Validate string length
   */
  length(value: string, fieldName: string, min: number, max: number): boolean {
    if (value.length < min || value.length > max) {
      throw new ValidationError(`${fieldName} must be between ${min} and ${max} characters`);
    }
    return true;
  },

  /**
   * Validate URL format
   */
  url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      throw new ValidationError('Invalid URL format');
    }
  },

  /**
   * Validate credentials
   */
  credentials(username?: string, password?: string): boolean {
    if (!username || username.trim().length === 0) {
      throw new ValidationError('Username is required');
    }
    if (!password || password.trim().length === 0) {
      throw new ValidationError('Password is required');
    }
    return true;
  }
};

/**
 * Validation helper functions
 */
export const validate = {
  /**
   * Validate user input for creating/updating users
   */
  userInput(data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string;
    install_ids?: string[];
  }): void {
    if (data.first_name) {
      validators.required(data.first_name, 'First name');
      validators.length(data.first_name, 'First name', 1, 50);
    }
    if (data.last_name) {
      validators.required(data.last_name, 'Last name');
      validators.length(data.last_name, 'Last name', 1, 50);
    }
    if (data.email) {
      validators.email(data.email);
    }
    if (data.roles) {
      validators.roles(data.roles);
    }
    if (data.install_ids) {
      data.install_ids.forEach(id => validators.installId(id));
    }
  },

  /**
   * Validate backup input
   */
  backupInput(data: {
    description?: string;
    notification_emails?: string[];
  }): void {
    if (data.description) {
      validators.length(data.description, 'Description', 1, 255);
    }
    if (data.notification_emails) {
      data.notification_emails.forEach(email => validators.email(email));
    }
  },

  /**
   * Validate domain input
   */
  domainInput(data: {
    name?: string;
    primary?: boolean;
  }): void {
    if (data.name) {
      validators.required(data.name, 'Domain name');
      // Basic domain format validation
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(data.name)) {
        throw new ValidationError('Invalid domain name format');
      }
    }
  }
};
