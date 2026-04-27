import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';

@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('link')
  async linkWallet(@Body() payload: WalletLinkRequest, @Req() req: any) {
    return this.walletService.linkWallet(req.user.sub, payload);
  }

  @Post('recovery-request')
  async requestRecovery(@Body() payload: WalletRecoveryRequestDto, @Req() req: any) {
    return this.walletService.requestRecovery(req.user.sub, payload);
  }

  @Get('status')
  async getStatus(@Req() req: any) {
    return this.walletService.getStatus(req.user.sub);
  }
}
