import { Controller, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FraudReportsService } from './fraud-reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tố cáo & Gian lận (Fraud Reports)')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('fraud-reports')
export class FraudReportsController {
  constructor(private readonly fraudReportsService: FraudReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Gửi một báo cáo tố cáo gian lận đối với tài sản' })
  @ApiResponse({ status: 201, description: 'Báo cáo đã được ghi nhận vào hệ thống' })
  createReport(
    @Body('tokenId') tokenId: string,
    @Body('reportType') reportType: string,
    @Body('description') description: string,
    @Body('evidenceLinks') evidenceLinks: string,
    @CurrentUser() user: any,
  ) {
    return this.fraudReportsService.createReport(tokenId, user.sub, reportType, description, evidenceLinks);
  }

  @Patch(':id/resolve')
  @RequireRoles('ADMIN', 'LANH_DAO', 'CAN_BO')
  @ApiOperation({ summary: 'Xử lý báo cáo tố cáo (Chấp nhận hoặc Từ chối)' })
  @ApiResponse({ status: 200, description: 'Đã cập nhật kết quả xử lý. Nếu lockNft=true, tài sản sẽ bị khóa.' })
  resolveReport(
    @Param('id', ParseIntPipe) id: number,
    @Body('resolutionStatus') resolutionStatus: string,
    @Body('notes') notes: string,
    @Body('lockNft') lockNft: boolean,
    @CurrentUser() user: any,
  ) {
    return this.fraudReportsService.resolveReport(id, user.sub, resolutionStatus, notes, lockNft);
  }
}
