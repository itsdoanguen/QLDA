import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  AuthVerifyOtpRequest,
  AuthSendOtpRequest,
} from '@land-registry/shared-types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Initiate login process (VNeID login simulation)' })
  async login(@Query('nationalId') nationalId: string) {
    return this.authService.login({ nationalId });
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  async verifyOtp(@Body() payload: AuthVerifyOtpRequest) {
    return this.authService.verifyOtp(payload);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Resend OTP code' })
  async sendOtp(@Body() payload: AuthSendOtpRequest) {
    return this.authService.sendOtp(payload);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@Req() req: any) {
    return this.authService.logout(req.user, req.headers.authorization);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.sub);
  }
}
