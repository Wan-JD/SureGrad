import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWithPasswordDto } from './dto/login-with-password.dto';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterWithPasswordDto } from './dto/register-with-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyCaptchaDto } from './dto/verify-captcha.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @HttpCode(200)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('login/otp')
  @HttpCode(200)
  loginWithOtp(@Body() dto: LoginWithOtpDto) {
    return this.authService.loginWithOtp(dto);
  }

  @Post('captcha/issue')
  @HttpCode(200)
  issueCaptcha() {
    return this.authService.issueCaptcha();
  }

  @Post('login/captcha')
  @HttpCode(200)
  loginWithCaptcha(@Body() dto: VerifyCaptchaDto & { phone: string }) {
    return this.authService.loginWithCaptcha(dto);
  }

  @Post('register')
  @HttpCode(200)
  registerWithPassword(@Body() dto: RegisterWithPasswordDto) {
    return this.authService.registerWithPassword(dto);
  }

  @Post('login/password')
  @HttpCode(200)
  loginWithPassword(@Body() dto: LoginWithPasswordDto) {
    return this.authService.loginWithPassword(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
