import { SetMetadata } from '@nestjs/common';

export const CUSTOM_CACHE_KEY_META = 'custom_cache_key_fields';

/**
 * Define which request fields should be used in the cache key.
 * Example: ['params.id', 'user.id']
 */
export const CacheKey = (fields: string[]) =>
  SetMetadata(CUSTOM_CACHE_KEY_META, fields);
