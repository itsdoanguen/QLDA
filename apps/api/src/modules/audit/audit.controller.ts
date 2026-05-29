import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@ApiTags('Bảo mật (Audit Logging)')
@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly blockchainService: BlockchainService
  ) {}

  @Get('verify/:hash')
  @ApiOperation({ summary: 'Xác minh tính toàn vẹn của một Audit Log qua Blockchain' })
  @ApiResponse({ status: 200, description: 'Trả về kết quả xác minh' })
  async verifyLogHash(@Param('hash') hash: string) {
    if (!hash || !hash.startsWith('0x')) {
      throw new BadRequestException('Hash không hợp lệ');
    }

    if (!this.blockchainService.auditLogContract) {
      throw new BadRequestException('Smart Contract chưa được khởi tạo');
    }

    try {
      const timestamp = await this.blockchainService.auditLogContract.verifyLogHash(hash);
      const isVerified = timestamp > 0n;
      
      return {
        hash,
        isVerified,
        timestamp: isVerified ? Number(timestamp) : null,
      };
    } catch (error: any) {
      throw new BadRequestException(`Lỗi khi xác minh qua blockchain: ${error.message}`);
    }
  }
}
