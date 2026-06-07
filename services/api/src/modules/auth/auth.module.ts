import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { OtpService } from './otp.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, CaptchaService],
})
export class AuthModule {}
