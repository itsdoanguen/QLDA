import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  AuthLoginRequest,
  AuthVerifyOtpRequest,
  AuthSendOtpRequest,
  AuthLogoutRequest,
} from '@land-registry/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() payload: AuthLoginRequest) {
    return this.authService.login(payload);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() payload: AuthVerifyOtpRequest) {
    return this.authService.verifyOtp(payload);
  }

  @Post('send-otp')
  async sendOtp(@Body() payload: AuthSendOtpRequest) {
    return this.authService.sendOtp(payload);
  }

  @Post('logout')
  async logout(@Body() payload: AuthLogoutRequest, @Req() req: any) {
    return this.authService.logout(payload, req.headers.authorization);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.sub);
  }
}
