import { Module } from '@nestjs/common';
import { JwtGuard } from './guards';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [JwtGuard, JwtService],
  exports: [JwtGuard, JwtService],
})
export class AuthModule {}
