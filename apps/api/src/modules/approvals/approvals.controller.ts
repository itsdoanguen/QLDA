import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BatchSignRequestDto, BatchSignResponseDto } from './dto/batch-sign.dto';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}
  
  @Get('stats')
  @RequireRoles('LANH_DAO', 'ADMIN')
  @ApiOperation({ summary: 'Get dashboard statistics for Lãnh đạo' })
  getStats() {
    return this.approvalsService.getStats();
  }

  @Get('pending')
  @RequireRoles('LANH_DAO')
  @ApiOperation({ summary: 'List all records pending Lãnh đạo approval' })
  getPending() {
    return this.approvalsService.findPendingApprovals();
  }

  @Get('approved')
  @RequireRoles('LANH_DAO')
  @ApiOperation({ summary: 'List all records already approved by Lãnh đạo' })
  getApproved() {
    return this.approvalsService.findApprovedApprovals();
  }

  @Post(':id/sign')
  @RequireRoles('LANH_DAO')
  @ApiOperation({ summary: 'Lãnh đạo sign and approve a record' })
  sign(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() body: { reason?: string },
  ) {
    return this.approvalsService.sign(id, user.sub, body.reason);
  }

  @Post(':id/reject')
  @RequireRoles('LANH_DAO')
  @ApiOperation({ summary: 'Lãnh đạo reject a record' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() body: { reason: string },
  ) {
    return this.approvalsService.reject(id, user.sub, body.reason);
  }

  @Post('batch-sign')
  @RequireRoles('LANH_DAO')
  @ApiOperation({
    summary: 'Lãnh đạo batch sign — ký duyệt/từ chối hàng loạt nhiều hồ sơ',
    description: 'Gửi danh sách hồ sơ cần ký. Mỗi item gồm recordId, isApproved, reason (bắt buộc khi từ chối). '
      + 'Backend sẽ cập nhật DB cho từng hồ sơ, sau đó gọi MultiSigWorkflow.batchSignTransactions() on-chain một lần duy nhất.',
  })
  @ApiOkResponse({ type: BatchSignResponseDto })
  batchSign(
    @CurrentUser() user: any,
    @Body() body: BatchSignRequestDto,
  ) {
    return this.approvalsService.batchSign(body.records, user.sub);
  }
}
