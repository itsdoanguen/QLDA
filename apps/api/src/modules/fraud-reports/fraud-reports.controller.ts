import { Controller, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FraudReportsService } from './fraud-reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Fraud Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('fraud-reports')
export class FraudReportsController {
  constructor(private readonly fraudReportsService: FraudReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new fraud report' })
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
  @ApiOperation({ summary: 'Resolve a fraud report and optionally lock/unlock NFT' })
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
