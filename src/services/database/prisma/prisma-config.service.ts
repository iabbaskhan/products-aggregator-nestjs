import { Injectable } from '@nestjs/common';
import { ConfigService, DBSecrets } from '@config';

/**
 * Service to provide Prisma configuration using ConfigService
 * This service builds the DATABASE_URL from dbSecrets
 */
@Injectable()
export class PrismaConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the DATABASE_URL from ConfigService dbSecrets
   * @returns The complete DATABASE_URL string
   */
  getDatabaseUrl(): string {
    const { HOST, PORT, USERNAME, PASSWORD, DATABASE } = this.configService.dbSecrets;
    const dbHost = process.env.NODE_ENV === 'development' ? 'postgres' : HOST;
    return `postgresql://${USERNAME}:${PASSWORD}@${dbHost}:${PORT}/${DATABASE}?schema=public`;
  }

  /**
   * Get individual database connection parameters
   * @returns DBSecrets object
   */
  getDatabaseSecrets(): DBSecrets {
    return this.configService.dbSecrets;
  }

  /**
   * Set DATABASE_URL environment variable for Prisma CLI commands
   * This method can be called before running Prisma commands
   */
  setDatabaseUrlEnvironment(): void {
    const databaseUrl = this.getDatabaseUrl();
    process.env.DATABASE_URL = databaseUrl;
  }

  /**
   * Get database connection parameters as environment variables object
   * @returns Object with all database environment variables
   */
  getDatabaseEnvironment(): Record<string, string> {
    const { HOST, PORT, USERNAME, PASSWORD, DATABASE } = this.configService.dbSecrets;
    return {
      DATABASE_URL: this.getDatabaseUrl(),
      DB_HOST: HOST,
      DB_PORT: PORT,
      DB_USERNAME: USERNAME,
      DB_PASSWORD: PASSWORD,
      DB_DATABASE: DATABASE,
    };
  }
}
