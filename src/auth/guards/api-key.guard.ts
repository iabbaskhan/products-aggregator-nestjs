import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    console.log('apiKey', apiKey);
    console.log('validApiKey', this.configService.authSecrets.API_KEY);
    const validApiKey = this.configService.authSecrets.API_KEY;
    
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKey(request: any): string | undefined {
    const headerApiKey = request.headers['x-api-key'] || request.headers['X-API-Key'];
    console.log('headerApiKey', headerApiKey);
    if (headerApiKey) {
      return headerApiKey;
    }

    return undefined;
  }
}
