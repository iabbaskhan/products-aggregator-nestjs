#!/usr/bin/env ts-node

import { ConfigService } from '../src/config/config.service';

async function runPrismaWithConfig() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage: ts-node scripts/prisma-with-config.ts <prisma-command>',
    );
    console.error('Example: ts-node scripts/prisma-with-config.ts generate');
    console.error('Example: ts-node scripts/prisma-with-config.ts db push');
    process.exit(1);
  }

  try {
    console.log('🔧 Loading database configuration from ConfigService...');
    const configService = new ConfigService();
    const dbSecrets = await configService.getDBSecretsFromPrisma();
    const { HOST, PORT, USERNAME, PASSWORD, DATABASE } = dbSecrets;
    
    const dbHost = process.env.NODE_ENV === 'development' ? 'postgres' : HOST;
    const databaseUrl = `postgresql://${USERNAME}:${PASSWORD}@${dbHost}:${PORT}/${DATABASE}?schema=public`;
    process.env.DATABASE_URL = databaseUrl;

    console.log(
      `✅ Database URL configured: postgresql://${USERNAME}:***@${dbHost}:${PORT}/${DATABASE}`,
    );

    const { spawn } = require('child_process');
    
    let child;
    if (args[0] === 'seed') {
      console.log(`🚀 Running: node dist/prisma/seed.js`);
      child = spawn('node', ['dist/prisma/seed.js'], {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    } else {
      const prismaCommand = ['prisma', ...args];
      console.log(`🚀 Running: ${prismaCommand.join(' ')}`);
      child = spawn('npx', prismaCommand, {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    }

    child.on('close', (code: number) => {
      if (code === 0) {
        delete process.env.DATABASE_URL;
        console.log('✅ Prisma command completed successfully');
      } else {
        console.error(`❌ Prisma command failed with exit code ${code}`);
        process.exit(code);
      }
    });

    child.on('error', (error: Error) => {
      console.error('❌ Failed to start Prisma command:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to load configuration:', error);
    process.exit(1);
  }
}

runPrismaWithConfig();
