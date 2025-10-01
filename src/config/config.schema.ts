import { z } from 'zod';

export const AppSecretsSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'staging']),
  PORT: z
    .string()
    .nonempty('PORT is required')
    .transform((value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new Error('PORT must be a valid number');
      }
      return parsed;
    }),
  DATA_STALENESS_MINUTES: z
    .string()
    .default('10')
    .transform((value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed <= 0) {
        throw new Error('DATA_STALENESS_MINUTES must be a positive number');
      }
      return parsed;
    })
    .describe('Number of minutes after which data is considered stale'),
});
export type AppSecrets = z.infer<typeof AppSecretsSchema>;

export const AuthSecretsSchema = z.object({
  JWT_PUBLIC_KEY: z.string().nonempty('JWT_PUBLIC_KEY is required'),
  JWT_SECRET_KEY: z.string().nonempty('JWT_SECRET_KEY is required'),
  API_KEY: z.string().nonempty('AP_KEY is required'),
});
export type AuthSecrets = z.infer<typeof AuthSecretsSchema>;

export const DBSecretsSchema = z.object({
  HOST: z.string().nonempty('HOST is required'),
  PORT: z.string().nonempty('PORT is required'),
  USERNAME: z.string().nonempty('USERNAME is required'),
  PASSWORD: z.string().optional(),
  DATABASE: z.string().nonempty('DATABASE is required'),
});
export type DBSecrets = z.infer<typeof DBSecretsSchema>;
