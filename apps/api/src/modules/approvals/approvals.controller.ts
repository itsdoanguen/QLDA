import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
  @ApiOperation({ summary: 'Lãnh đạo batch sign and approve/reject multiple records' })
  batchSign(
    @CurrentUser() user: any,
    @Body() body: { records: { recordId: number; isApproved: boolean; reason?: string }[] },
  ) {
    return this.approvalsService.batchSign(body.records, user.sub);
  }
}
