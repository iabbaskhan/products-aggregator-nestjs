import { Injectable } from '@nestjs/common';
import { InfisicalSDK } from '@infisical/sdk';
import {
  AppSecrets,
  AppSecretsSchema,
  AuthSecrets,
  AuthSecretsSchema,
  DBSecrets,
  DBSecretsSchema,
} from './config.schema';

@Injectable()
export class ConfigService {
  private readonly infisicalClient: InfisicalSDK;
  private readonly infisicalSiteUrl = 'https://app.infisical.com';
  appSecrets: AppSecrets;
  authSecrets: AuthSecrets;
  dbSecrets: DBSecrets;

  constructor() {
    this.infisicalClient = new InfisicalSDK({
      siteUrl: this.infisicalSiteUrl,
    });
  }

  /**
   * Fetch and store secrets from Infisical on application bootstrap
   */
  async loadSecrets() {
    if (!this.canAuthenticateInfisical()) {
      console.warn('⚠️  Infisical not configured, using environment variables as fallback');
      this.loadSecretsFromEnvironment();
      return;
    }

    try {
      await this.authenticateInfisical();
      this.appSecrets = await this.getAppSecrets();
      this.dbSecrets = await this.getDBSecrets();
      this.authSecrets = await this.getAuthSecrets();
      console.log('✅ Secrets loaded successfully from Infisical');
    } catch (error) {
      console.error('❌ Failed to load secrets from Infisical:', error.message);
      console.warn('⚠️  Falling back to environment variables');
      this.loadSecretsFromEnvironment();
    }
  }

  /**
   * Authenticate the Infisical client using Universal Auth
   */
  async authenticateInfisical() {
    if (!this.canAuthenticateInfisical()) {
      throw new Error(
        'INFISICAL_MACHINE_IDENTITY_CLIENT_ID or INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET is not set',
      );
    }
    await this.infisicalClient.auth().universalAuth.login({
      clientId: process.env.INFISICAL_MACHINE_IDENTITY_CLIENT_ID,
      clientSecret: process.env.INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET,
    });
  }

  /**
   * Check if the Infisical client can be authenticated
   */
  canAuthenticateInfisical() {
    return (
      !!process.env.INFISICAL_MACHINE_IDENTITY_CLIENT_ID &&
      !!process.env.INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET
    );
  }

  /** Get the general app secrets from Infisical
   * @returns {AppSecrets} The app secrets
   */
  async getAppSecrets(): Promise<AppSecrets> {
    const allSecrets = await this.infisicalClient.secrets().listSecrets({
      environment: process.env.INFISICAL_ENVIRONMENT,
      projectId: process.env.INFISICAL_PROJECT_ID,
      secretPath: '/app',
    });

    const appSecrets: Record<string, string> = {};
    allSecrets.secrets.forEach((secret) => {
      appSecrets[secret.secretKey] = secret.secretValue;
    });

    try {
      const appSecretsValidated = AppSecretsSchema.parse(appSecrets);
      return appSecretsValidated;
    } catch (error) {
      console.error('Invalid secrets:', error);
      throw new Error('Failed to validate application secrets');
    }
  }

  /** Get the app's auth secrets from Infisical
   * @returns {AuthSecrets} The auth secrets
   */
  async getAuthSecrets(): Promise<AuthSecrets> {
    const allSecrets = await this.infisicalClient.secrets().listSecrets({
      environment: process.env.INFISICAL_ENVIRONMENT,
      projectId: process.env.INFISICAL_PROJECT_ID,
      secretPath: '/auth',
    });

    const authSecrets: Partial<AuthSecrets> = {};
    allSecrets.secrets.forEach((secret) => {
      authSecrets[secret.secretKey as keyof AuthSecrets] = secret.secretValue;
    });

    try {
      const authSecretsValidated = AuthSecretsSchema.parse(authSecrets);
      return authSecretsValidated;
    } catch (error) {
      console.error('Invalid secrets:', error);
      throw new Error('Failed to validate auth secrets');
    }
  }

  /**
   * Get the DB secrets from Infisical
   * @returns {DBSecrets} The DB secrets
   */
  async getDBSecrets(): Promise<DBSecrets> {
    const allSecrets = await this.infisicalClient.secrets().listSecrets({
      environment: process.env.INFISICAL_ENVIRONMENT,
      projectId: process.env.INFISICAL_PROJECT_ID,
      secretPath: '/db',
    });

    const dbSecrets: Partial<DBSecrets> = {};
    allSecrets.secrets.forEach((secret) => {
      dbSecrets[secret.secretKey as keyof DBSecrets] = secret.secretValue;
    });

    try {
      const dbSecretsValidated = DBSecretsSchema.parse(dbSecrets);
      return dbSecretsValidated;
    } catch (error) {
      console.error('Invalid secrets:', error);
      throw new Error('Failed to validate database secrets');
    }
  }

  /**
   * Get the DB secrets from Prisma without the need to load all secrets from Infisical
   * @returns {DBSecrets} The DB secrets
   */
  async getDBSecretsFromPrisma(): Promise<DBSecrets> {
    await this.authenticateInfisical();
    const dbSecrets = await this.getDBSecrets();
    console.log('✅ DB secrets loaded from Prisma');
    console.log(dbSecrets);
    return dbSecrets;
  }

  /**
   * Load secrets from environment variables as fallback
   */
  private loadSecretsFromEnvironment() {
    try {
      this.appSecrets = AppSecretsSchema.parse({
        PORT: process.env.PORT || '3000',
        NODE_ENV: process.env.NODE_ENV || 'development',
        AGGREGATION_INTERVAL: process.env.AGGREGATION_INTERVAL || '*/30 * * * * *',
        DATA_STALENESS_MINUTES: process.env.DATA_STALENESS_MINUTES || '10',
      });

      this.dbSecrets = DBSecretsSchema.parse({
        HOST: process.env.DB_HOST || 'localhost',
        PORT: process.env.DB_PORT || '5432',
        USERNAME: process.env.DB_USERNAME || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || '',
        DATABASE: process.env.DB_DATABASE || 'product_aggregator',
      });

      this.authSecrets = AuthSecretsSchema.parse({
        JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || 'your-jwt-secret-key-here',
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'your-jwt-secret-key-here',
      });

      console.log('✅ Secrets loaded from environment variables');
    } catch (error) {
      console.error('❌ Failed to validate environment variables:', error);
      throw new Error('Invalid environment variable configuration');
    }
  }

  /**
   * Check if all secrets are loaded
   * @returns {boolean} True if all secrets are loaded, false otherwise
   */
  allSecretsLoaded(): boolean {
    return [this.appSecrets, this.dbSecrets, this.authSecrets].every(
      (secret) => secret !== null,
    );
  }
}
