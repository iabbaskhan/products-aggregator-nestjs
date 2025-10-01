# Prisma Configuration Scripts

This directory contains a script to integrate Prisma commands with the ConfigService, allowing you to use database configuration from centralized secrets manager, Infisical instead of environment variables.

## Scripts Overview

### 1. `prisma-with-config.ts`
Main script that runs Prisma commands using ConfigService database configuration. It loads the Database related environment variables from Infisical, builds the `DATABASE_URL` needed by Prisma and then 

## PNPM Scripts

The following scripts also work with use ConfigService:

```bash
# Generate Prisma client
pnpm run prisma:generate

# Push schema to database
pnpm run prisma:push

# Run migrations
pnpm run prisma:migrate

# Open Prisma Studio
pnpm run prisma:studio

# Reset database
pnpm run prisma:reset

# Deploy migrations (production)
pnpm run prisma:deploy

# Complete database setup
pnpm run db:setup
```

## How It Works

1. **ConfigService Integration**: Scripts load database configuration from Infisical using the ConfigService
2. **DATABASE_URL Construction**: Database connection parameters (HOST, PORT, USERNAME, PASSWORD, DATABASE) are combined into a PostgreSQL connection string
3. **Environment Variable Setting**: The constructed DATABASE_URL is set as an environment variable
4. **Prisma Command Execution**: Prisma commands are executed with the configured DATABASE_URL

## Prerequisites

Before using these scripts, ensure:

1. **Infisical Configuration**: Set the following environment variables:
   - `INFISICAL_MACHINE_IDENTITY_CLIENT_ID`
   - `INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET`
   - `INFISICAL_ENVIRONMENT`
   - `INFISICAL_PROJECT_ID`

2. **Database Secrets**: Ensure the following secrets are configured in Infisical under `/db` path:
   - `HOST`
   - `PORT`
   - `USERNAME`
   - `PASSWORD`
   - `DATABASE`

## Benefits

- **Centralized Configuration**: Database configuration is managed in Infisical
- **Security**: Database credentials are not stored in environment variables or files
- **Consistency**: All Prisma commands use the same configuration source
- **Flexibility**: Easy to switch between different environments (dev, staging, production)

## Troubleshooting

### Common Issues

1. **Infisical Authentication Failed**
   - Verify `INFISICAL_MACHINE_IDENTITY_CLIENT_ID` and `INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET` are set
   - Check that the machine identity has access to the project

2. **Database Connection Failed**
   - Verify database secrets are correctly configured in Infisical
   - Check that the database server is accessible from your network

3. **Prisma Command Not Found**
   - Ensure Prisma CLI is installed: `pnpm install -g prisma`
   - Or use npx: `npx prisma <command>`

### Debug Mode

To see detailed output, you can run the scripts directly:

```bash
# See detailed configuration loading
ts-node scripts/prisma-with-config.ts generate
