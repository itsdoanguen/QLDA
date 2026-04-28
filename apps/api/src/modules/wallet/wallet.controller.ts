import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';
import { WalletDetailsResponseDto, WalletStatusResponseDto } from './dto/wallet-response.dto';

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('link')
  @ApiOperation({ summary: 'Link a blockchain wallet address to the user profile' })
  async linkWallet(@Body() payload: WalletLinkRequest, @Req() req: any) {
    return this.walletService.linkWallet(req.user.sub, payload);
  }

  @Post('recovery-request')
  @ApiOperation({ summary: 'Request wallet recovery' })
  async requestRecovery(@Body() payload: WalletRecoveryRequestDto, @Req() req: any) {
    return this.walletService.requestRecovery(req.user.sub, payload);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current wallet status (Bearer access token only)' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: WalletStatusResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getStatus(@Req() req: any) {
    return this.walletService.getStatus(req.user.sub);
  }

  @Get('details')
  @ApiOperation({ summary: 'Get current wallet details (Bearer access token only)' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: WalletDetailsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getDetails(@Req() req: any) {
    return this.walletService.getWalletDetails(req.user.sub);
  }
}
