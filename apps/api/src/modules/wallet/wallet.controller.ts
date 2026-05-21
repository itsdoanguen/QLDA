import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';
import { WalletDetailsResponseDto, WalletStatusResponseDto } from './dto/wallet-response.dto';
import { RejectRecoveryDto, RecoveryRequestDetailDto } from './dto/wallet-recovery.dto';

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('link')
  @ApiOperation({ summary: 'Link a blockchain wallet address to the user profile' })
  async linkWallet(@Body() payload: WalletLinkRequest, @CurrentUser() user: any) {
    return this.walletService.linkWallet(user.sub, payload);
  }

  @Post('recovery-request')
  @ApiOperation({ summary: 'Request wallet recovery (citizen submits request)' })
  async requestRecovery(@Body() payload: WalletRecoveryRequestDto, @CurrentUser() user: any) {
    return this.walletService.requestRecovery(user.sub, payload);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current wallet status (Bearer access token only)' })
  @ApiOkResponse({ type: WalletStatusResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getStatus(@CurrentUser() user: any) {
    return this.walletService.getStatus(user.sub);
  }

  @Get('details')
  @ApiOperation({ summary: 'Get current wallet details (Bearer access token only)' })
  @ApiOkResponse({ type: WalletDetailsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getDetails(@CurrentUser() user: any) {
    return this.walletService.getWalletDetails(user.sub);
  }

  // --- Admin / Lãnh đạo: Wallet Recovery Management ---

  @Get('recovery-requests')
  @RequireRoles('LANH_DAO', 'ADMIN')
  @ApiOperation({ summary: 'List all recovery requests (Admin/Lãnh đạo). Filter by status.' })
  @ApiQuery({ name: 'status', required: false, enum: ['Pending', 'Approved', 'Rejected'] })
  @ApiOkResponse({ type: [RecoveryRequestDetailDto] })
  async listRecoveryRequests(@Query('status') status?: string) {
    return this.walletService.listRecoveryRequests(status);
  }

  @Get('recovery-requests/:id')
  @RequireRoles('LANH_DAO', 'ADMIN')
  @ApiOperation({ summary: 'Get recovery request details (Admin/Lãnh đạo)' })
  @ApiOkResponse({ type: RecoveryRequestDetailDto })
  async getRecoveryRequestDetail(@Param('id', ParseIntPipe) id: number) {
    return this.walletService.getRecoveryRequestDetail(id);
  }

  @Post('recovery-requests/:id/approve')
  @RequireRoles('LANH_DAO', 'ADMIN')
  @ApiOperation({ summary: 'Approve wallet recovery — transfers NFTs on-chain (Lãnh đạo/Admin)' })
  async approveRecovery(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.walletService.approveRecovery(id, user.sub);
  }

  @Post('recovery-requests/:id/reject')
  @RequireRoles('LANH_DAO', 'ADMIN')
  @ApiOperation({ summary: 'Reject wallet recovery with reason (Lãnh đạo/Admin)' })
  async rejectRecovery(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejectRecoveryDto,
    @CurrentUser() user: any,
  ) {
    return this.walletService.rejectRecovery(id, user.sub, body.reason);
  }
}
