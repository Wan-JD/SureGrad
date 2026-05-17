import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('login/otp')
  loginWithOtp(@Body() dto: LoginWithOtpDto) {
    return this.authService.loginWithOtp(dto);
  }
}
