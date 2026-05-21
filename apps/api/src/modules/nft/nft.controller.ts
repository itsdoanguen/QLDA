import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { NftService } from './nft.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { NftVerifyResponseDto } from './dto/nft-verify.dto';

@ApiTags('NFT')
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post('mint/:recordId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('LANH_DAO', 'ADMIN') // Allow Admin for testing
  @ApiOperation({ summary: 'Mint a land NFT for a signed record' })
  mint(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.nftService.mint(recordId);
  }

  @Get('verify/qr')
  @ApiOperation({
    summary: 'Verify land NFT using QR code data (Public endpoint)',
    description: 'Nhận dữ liệu từ mã QR (chuỗi URL hoặc tokenId), giải mã/phân tích và truy vấn blockchain cùng với cơ sở dữ liệu hệ thống để xác thực tính toàn vẹn của chứng thư (Sổ đỏ).'
  })
  @ApiQuery({ name: 'qrData', description: 'Nội dung chuỗi QR Code được quét (hoặc tokenId trực tiếp)', example: 'https://landregistry.gov.vn/verify/1' })
  @ApiOkResponse({ type: NftVerifyResponseDto })
  async verifyQr(@Query('qrData') qrData: string) {
    return this.nftService.verifyNft(qrData);
  }

  @Get(':tokenId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get NFT details by token ID' })
  getOne(@Param('tokenId') tokenId: string) {
    return this.nftService.getByTokenId(tokenId);
  }

  @Get('owner/:address')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all NFTs owned by a wallet address' })
  getByOwner(@Param('address') address: string) {
    return this.nftService.getByOwner(address);
  }
}
