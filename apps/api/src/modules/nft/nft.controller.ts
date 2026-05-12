import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { NftService } from './nft.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';

@ApiTags('NFT')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post('mint/:recordId')
  @RequireRoles('LANH_DAO', 'ADMIN') // Allow Admin for testing
  @ApiOperation({ summary: 'Mint a land NFT for a signed record' })
  mint(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.nftService.mint(recordId);
  }

  @Get(':tokenId')
  @ApiOperation({ summary: 'Get NFT details by token ID' })
  getOne(@Param('tokenId') tokenId: string) {
    return this.nftService.getByTokenId(tokenId);
  }

  @Get('owner/:address')
  @ApiOperation({ summary: 'Get all NFTs owned by a wallet address' })
  getByOwner(@Param('address') address: string) {
    return this.nftService.getByOwner(address);
  }
}
