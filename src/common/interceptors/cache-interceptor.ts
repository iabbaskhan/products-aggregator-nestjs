import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CUSTOM_CACHE_KEY_META } from '../decorators/cache-key.decorator';

@Injectable()
export class FlexiCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(FlexiCacheInterceptor.name);

  constructor(cacheManager: Cache, reflector: Reflector) {
    super(cacheManager, reflector);
  }

  /**
   * Track the cache key based on the request fields
   * The fields are defined in the @CacheKey decorator
   * Example: ['params.id', 'user.id']
   *
   * @param context
   * @returns
   */
  trackBy(context: ExecutionContext): string {
    const handler = context.getHandler();
    const req: Request = context.switchToHttp().getRequest();
    const fields: string[] =
      this.reflector.get(CUSTOM_CACHE_KEY_META, handler) || [];

    let key = req.route?.path || req.url;

    for (const field of fields) {
      const value = this.resolveField(req, field);
      if (value !== undefined) {
        key += `:${field}=${value}`;
      }
    }

    req['cacheKey'] = key || undefined;
    this.logger.debug(`Cache key: ${key}`);
    return `cache:${key}`;
  }

  /**
   * Resolve the field from the request
   * Example: ['params.id', 'user.id']
   * @param req - The request object
   * @param path - The path to the field
   * @returns the value of the field
   */
  private resolveField(req: Request, path: string): string {
    return path.split('.').reduce((obj, part) => obj?.[part], req);
  }
}
