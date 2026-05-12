import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Tuân thủ & Pháp lý (Compliance)')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('disputes/:tokenId')
  @ApiOperation({ summary: 'Kiểm tra thông tin tranh chấp của một tài sản' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các tranh chấp đang diễn ra' })
  getDisputes(@Param('tokenId') tokenId: string) {
    return this.complianceService.getDisputes(tokenId);
  }

  @Get('mortgages/:tokenId')
  @ApiOperation({ summary: 'Kiểm tra thông tin thế chấp tại ngân hàng' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các hợp đồng thế chấp' })
  getMortgages(@Param('tokenId') tokenId: string) {
    return this.complianceService.getMortgages(tokenId);
  }

  @Get('planning-zones')
  @ApiOperation({ summary: 'Lấy thông tin danh sách các khu vực quy hoạch' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách vùng quy hoạch' })
  getPlanningZones() {
    return this.complianceService.getPlanningZones();
  }
}
